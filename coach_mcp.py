"""Shared FastMCP server for the running coach.

Lecture : par ordre de priorite —
  1. COACH_SNAPSHOT_URL (env) — URL explicite du snapshot JSON
  2. Fichiers locaux (public/coach-journal.json, dist/coach-journal.json)
  3. URL statique Vercel ({VERCEL_PROJECT_PRODUCTION_URL}/coach-journal.json)
  4. Generation live depuis la DB Neon (fallback Vercel — aucun fichier necessaire)

Ecriture : les outils `ajuster_le_plan` / `annuler_ajustement_plan` ecrivent dans
la table `plan_overrides`. C'est le seul canal par lequel une decision du coach
atteint le site : le calendrier marathon lui-meme est fige dans le code
(daily_training_plan._build_calendar), donc un ajustement note ailleurs (SKILL.md,
markdown du plan) reste invisible pour le dashboard.
"""
from __future__ import annotations

import json
import os
from datetime import date
from pathlib import Path
from typing import Any

import httpx
from fastmcp import FastMCP

REPO_ROOT = Path(__file__).resolve().parent
DEFAULT_SNAPSHOT_PATH = REPO_ROOT / "public" / "coach-journal.json"
STATIC_SNAPSHOT_PATHS = (
    DEFAULT_SNAPSHOT_PATH,
    REPO_ROOT / "dist" / "coach-journal.json",
    Path.cwd() / "public" / "coach-journal.json",
    Path.cwd() / "dist" / "coach-journal.json",
)

mcp = FastMCP("Coach Marathon")


def _snapshot_url() -> str:
    return os.environ.get("COACH_SNAPSHOT_URL", "").strip()


def _snapshot_path() -> Path:
    return Path(os.environ.get("COACH_SNAPSHOT_PATH", str(DEFAULT_SNAPSHOT_PATH)))


def _static_snapshot_url() -> str:
    base_url = os.environ.get("COACH_STATIC_BASE_URL", "").strip()
    # Vercel's production hostname is public and stable. A deployment-specific
    # VERCEL_URL may be protected and therefore unusable from the function.
    if not base_url and os.environ.get("VERCEL_PROJECT_PRODUCTION_URL"):
        base_url = f"https://{os.environ['VERCEL_PROJECT_PRODUCTION_URL']}"
    if not base_url:
        base_url = os.environ.get("BASE_URL", "").strip()
    if not base_url and os.environ.get("VERCEL_URL"):
        base_url = f"https://{os.environ['VERCEL_URL']}"
    if not base_url:
        return ""
    return f"{base_url.rstrip('/')}/coach-journal.json"


def _load_snapshot_url(url: str) -> dict[str, Any]:
    response = httpx.get(url, timeout=10)
    response.raise_for_status()
    return response.json()


def _generate_live_snapshot() -> dict[str, Any]:
    """Generate a coach snapshot live from DB (fallback when no static file exists)."""
    from datetime import timedelta
    import db as _db
    from runner_profile import PROFILE as RUNNER
    from daily_training_plan import build_three_day_training_guidance, set_plan_overrides

    today = date.today()
    today_iso = today.isoformat()
    seven_days_ago = (today - timedelta(days=7)).isoformat()

    # Apply coach plan overrides (best-effort)
    try:
        set_plan_overrides(_db.get_plan_overrides())
    except Exception as exc:
        print(f"[coach-mcp] plan overrides unavailable: {exc}", flush=True)
        set_plan_overrides({})

    # Recent runs for plan logic (90-day window)
    recent_runs = _db.get_recent_runs_for_plan(today_iso, days=90)[:10]
    latest_sleep = _db.get_latest_sleep_score(today_iso)
    guidance = build_three_day_training_guidance(today, recent_runs, latest_sleep)

    # 7-day volume
    vol_7j = sum(
        float(r.get("distance_km") or 0)
        for r in recent_runs
        if str(r.get("date") or "") >= seven_days_ago
    )

    # Format runs for coach output
    def _fmt_run(r: dict) -> dict:
        pace_s = r.get("pace_sec_per_km")
        allure = f"{int(pace_s) // 60}:{int(pace_s) % 60:02d}/km" if pace_s else ""
        return {
            "date": str(r.get("date") or "")[:10],
            "nom": r.get("name", "Run"),
            "distance_km": r.get("distance_km"),
            "allure": allure,
            "fc_moy": r.get("average_heartrate"),
            "fc_max": r.get("max_heartrate"),
        }

    derniers_runs = [_fmt_run(r) for r in recent_runs]

    # Other activities (last 14 days)
    autres: list[dict] = []
    try:
        cutoff_14d = (today - timedelta(days=14)).isoformat()
        for a in _db.get_cross_training_activities():
            if str(a.get("start_date_local") or "")[:10] >= cutoff_14d:
                autres.append({
                    "date": str(a.get("start_date_local") or "")[:10],
                    "type": a.get("type", ""),
                    "nom": a.get("name", ""),
                    "duree_min": round(int(a.get("elapsed_time") or 0) / 60),
                    "denivele_positif_m": round(float(a.get("total_elevation_gain") or 0)),
                })
    except Exception as exc:
        print(f"[coach-mcp] cross-training unavailable: {exc}", flush=True)

    # Next 3 sessions from guidance
    all_sessions = guidance.get("sessions", [])
    projection = [
        {
            "date": (today + timedelta(days=i)).isoformat(),
            "label": s.get("relativeLabel", f"J+{i}"),
            "titre": s.get("title", ""),
            "categorie": s.get("category", ""),
        }
        for i, s in enumerate(all_sessions[1:4], 1)
    ]

    objectif = (
        f"{RUNNER.race_name} — {RUNNER.race_date.isoformat()}, "
        f"calibrage {RUNNER.goal_label} ({RUNNER.pace('marathon')})"
    )

    return {
        "genere_le": today_iso,
        "objectif": objectif,
        "profil": RUNNER.as_dict(),
        "zones_allure": {key: RUNNER.pace(key) for key in RUNNER.paces},
        "derniers_runs": derniers_runs,
        "volume_7j_km": round(vol_7j, 1),
        "autres_activites": autres,
        "seance_du_jour": guidance,
        "projection": projection,
        "regle_ajustement": (
            "Fatigue marquée (VFC basse, sommeil < 60 ou 2 nuits POOR/FAIR consécutives) : "
            "réduire volume/intensité de 20 % ou convertir en footing facile. "
            "Forme OK (VFC BALANCED, sommeil ≥ 75) : tenir le plan. "
            "Toujours laisser 48h entre deux séances qualité."
        ),
    }


def load_snapshot() -> dict[str, Any]:
    """Load the latest coach snapshot from URL, local files, or generate live from DB."""
    snapshot_url = _snapshot_url()
    if snapshot_url:
        try:
            return _load_snapshot_url(snapshot_url)
        except Exception as exc:  # noqa: BLE001 - local fallback keeps MCP usable
            print(f"[coach-mcp] snapshot URL failed ({exc}); using local file", flush=True)

    paths = (_snapshot_path(), *STATIC_SNAPSHOT_PATHS)
    seen: set[Path] = set()
    for path in paths:
        candidate = path.resolve()
        if candidate in seen:
            continue
        seen.add(candidate)
        if candidate.exists():
            with candidate.open(encoding="utf-8") as handle:
                return json.load(handle)

    static_url = _static_snapshot_url()
    if static_url:
        try:
            return _load_snapshot_url(static_url)
        except Exception as exc:  # noqa: BLE001
            print(f"[coach-mcp] static snapshot URL failed ({exc})", flush=True)

    # Final fallback: generate live from DB (Vercel production path)
    print("[coach-mcp] no snapshot found; generating live from DB", flush=True)
    return _generate_live_snapshot()


def _bounded_count(value: int, default: int = 3, maximum: int = 7) -> int:
    try:
        count = int(value)
    except (TypeError, ValueError):
        count = default
    return max(1, min(maximum, count))


def _recent_runs(snapshot: dict[str, Any], count: int) -> list[dict[str, Any]]:
    runs = snapshot.get("derniers_runs") or []
    return list(runs[:_bounded_count(count)])


def _training_payload(snapshot: dict[str, Any]) -> dict[str, Any]:
    return {
        "genere_le": snapshot.get("genere_le"),
        "objectif": snapshot.get("objectif"),
        "aujourdhui": snapshot.get("seance_du_jour"),
        "projection": snapshot.get("projection", []),
        "zones_allure": snapshot.get("zones_allure"),
        "autres_activites": snapshot.get("autres_activites", []),
        "regle_ajustement": snapshot.get("regle_ajustement"),
        "consigne_fatigue": (
            "Les autres activites ne comptent pas dans le volume de course, "
            "mais leur duree et leur denivele doivent peser sur la fraicheur."
        ),
    }


def _analysis_payload(snapshot: dict[str, Any], nombre: int = 3) -> dict[str, Any]:
    runs = _recent_runs(snapshot, nombre)
    return {
        "genere_le": snapshot.get("genere_le"),
        "objectif": snapshot.get("objectif"),
        "volume_7j_km": snapshot.get("volume_7j_km"),
        "dernier_run": runs[0] if runs else None,
        "runs": runs,
        "autres_activites": snapshot.get("autres_activites", []),
        "consigne_client": (
            "Analyse les runs et la charge hors course recente, sans compter "
            "celle-ci dans le volume running. Examine fractions, allure, FC, "
            "duree et denivele, puis termine par un avis clair sur la suite."
        ),
    }


@mcp.tool
def journal_du_jour() -> dict[str, Any]:
    """Return the complete coach snapshot: profile, goal, recent runs and plan."""
    return load_snapshot()


@mcp.tool
def entrainement_a_faire() -> dict[str, Any]:
    """Return today's training, next sessions, pace zones and adjustment rule."""
    return _training_payload(load_snapshot())


@mcp.tool
def seance_du_jour() -> dict[str, Any]:
    """Return today's planned session with generation date."""
    snapshot = load_snapshot()
    return {
        "genere_le": snapshot.get("genere_le"),
        **(snapshot.get("seance_du_jour") or {}),
    }


@mcp.tool
def analyse_runs_precedents(nombre: int = 3) -> dict[str, Any]:
    """Return recent runs for coaching analysis, newest first."""
    return _analysis_payload(load_snapshot(), nombre)


@mcp.tool
def sept_derniers_runs() -> dict[str, Any]:
    """Return the 7 latest analyzed runs with splits, pace and heart rate."""
    snapshot = load_snapshot()
    return {
        "genere_le": snapshot.get("genere_le"),
        "volume_7j_km": snapshot.get("volume_7j_km"),
        "runs": snapshot.get("derniers_runs", []),
    }


@mcp.tool
def autres_activites() -> dict[str, Any]:
    """Return recent non-running activities (hiking, cycling, skiing, strength…).

    Elles ne comptent ni dans le volume, ni dans les allures, ni dans les records
    — mais elles pesent sur la fraicheur. Une grosse rando la veille justifie
    d'alleger la seance du lendemain via `ajuster_le_plan`.
    """
    snapshot = load_snapshot()
    activites = snapshot.get("autres_activites") or []
    return {
        "genere_le": snapshot.get("genere_le"),
        "activites": activites,
        "consigne_client": (
            "Ces activites ne sont pas des courses : ne les compte jamais dans le "
            "volume hebdomadaire. Sers-t'en uniquement pour juger la fatigue "
            "(denivele, duree, temps sur pieds) avant de programmer une seance a "
            "enjeu, et ajuste le plan avec `ajuster_le_plan` si besoin."
        ),
    }


@mcp.tool
def projection() -> dict[str, Any]:
    """Return the next 3 planned sessions and the coach adjustment rule."""
    snapshot = load_snapshot()
    return {
        "genere_le": snapshot.get("genere_le"),
        "objectif": snapshot.get("objectif"),
        "projection": snapshot.get("projection", []),
        "regle_ajustement": snapshot.get("regle_ajustement"),
    }


@mcp.tool
def zones_allure() -> dict[str, Any]:
    """Return target pace zones for easy, threshold, race pace and VO2max work."""
    snapshot = load_snapshot()
    return {
        "profil": snapshot.get("profil"),
        "zones_allure": snapshot.get("zones_allure"),
    }


@mcp.tool
def poser_question_coach(question: str) -> dict[str, Any]:
    """Return the coach context needed to answer a natural-language question."""
    snapshot = load_snapshot()
    lower_question = (question or "").lower()
    if any(word in lower_question for word in ("aujourd", "seance", "entrainement", "faire")):
        contexte: dict[str, Any] = _training_payload(snapshot)
    elif any(word in lower_question for word in ("run", "course", "preced", "analyse", "dernier")):
        contexte = _analysis_payload(snapshot, 3)
    else:
        contexte = _training_payload(snapshot)
    return {
        "question": question,
        "consigne_client": (
            "Reponds comme un coach running concis, en francais, en utilisant "
            "uniquement ce snapshot. Cite les dates, allures et volumes utiles. "
            "Si la donnee n'est pas dans le snapshot, dis-le clairement."
        ),
        "contexte_selectionne": contexte,
        "snapshot": snapshot,
    }


# ── Ajustements du plan (ecriture) ──

_ISO_DAY_LENGTH = 10


def _normalized_day(jour: str) -> str:
    """Valide un jour ISO 'YYYY-MM-DD' (evite d'ecrire une cle bancale en base)."""
    day = str(jour or "").strip()[:_ISO_DAY_LENGTH]
    date.fromisoformat(day)  # leve ValueError si le format est invalide
    return day


def _plan_write_deps():
    """Charge db + le plan a la demande : le MCP reste utilisable sans base."""
    import db
    from daily_training_plan import normalize_plan_override

    return db, normalize_plan_override


@mcp.tool
def donnees_recuperation(jours: int = 7) -> dict[str, Any]:
    """Return full Garmin recovery snapshot: sleep, HRV, resting HR and body battery.

    Combine sommeil (score/qualite/duree), VFC nuit (HRV last night avg ms,
    statut BALANCED/LOW/UNBALANCED, baseline), FC repos et delta body battery
    pour les N derniers jours. Utilise ces donnees pour ajuster la seance du
    jour : une VFC basse + mauvais sommeil = signal de surcharge.
    """
    from datetime import timedelta

    db, _ = _plan_write_deps()
    import db as _db_mod

    today = date.today()

    # --- Sommeil ---
    sommeil = []
    for i in range(jours):
        day = today - timedelta(days=i)
        row = db.get_latest_sleep_score(str(day))
        if row:
            duration_h = round(row["sleep_duration_seconds"] / 3600, 1) if row.get("sleep_duration_seconds") else None
            sommeil.append({
                "date": row["date"],
                "score": row.get("sleep_score"),
                "qualite": row.get("sleep_quality"),
                "duree_heures": duration_h,
            })

    # --- HRV, FC repos, body battery (depuis les activites recentes) ---
    try:
        conn = _db_mod._safe_conn()
        cur = conn.cursor()
        since = (today - timedelta(days=jours)).isoformat()
        cur.execute("""
            SELECT
                start_date_local::date AS jour,
                health_hrv_last_night_avg_ms,
                health_hrv_weekly_avg_ms,
                health_hrv_status,
                health_hrv_baseline_low_ms,
                health_hrv_baseline_high_ms,
                health_resting_hr_bpm,
                health_resting_hr_7d_avg_bpm,
                body_battery_delta
            FROM activities
            WHERE type = 'Run'
              AND start_date_local >= %s
              AND (health_hrv_last_night_avg_ms IS NOT NULL
                   OR health_resting_hr_bpm IS NOT NULL
                   OR body_battery_delta IS NOT NULL)
            ORDER BY start_date_local DESC
            LIMIT %s
        """, [since, jours])
        cols = [d[0] for d in cur.description]
        sante = [dict(zip(cols, row)) for row in cur.fetchall()]
        for r in sante:
            if r.get("jour"):
                r["jour"] = str(r["jour"])[:10]
    except Exception:
        sante = []

    # --- Scores moyens ---
    scores = [r["score"] for r in sommeil if r.get("score") is not None]
    hrv_values = [r["health_hrv_last_night_avg_ms"] for r in sante if r.get("health_hrv_last_night_avg_ms")]
    avg_sleep = round(sum(scores) / len(scores), 1) if scores else None
    avg_hrv = round(sum(hrv_values) / len(hrv_values), 1) if hrv_values else None

    return {
        "periode_jours": jours,
        "score_sommeil_moyen": avg_sleep,
        "hrv_moyen_ms": avg_hrv,
        "sommeil": sommeil,
        "sante_runs": sante,
        "consigne_coach": (
            "SOMMEIL — Score >= 75 / GOOD : tenir le plan. "
            "60-74 / FAIR : option alleger (-20% volume ou intensite). "
            "< 60 / POOR ou 2 nuits consecutives mauvaises : footing facile ou repos. "
            "HRV — Statut BALANCED : recuperation correcte. "
            "LOW ou UNBALANCED : signal de fatigue, alleger la seance de qualite. "
            "HRV nuit < baseline_low : meme recommandation que POOR sommeil. "
            "BODY BATTERY delta negatif important (< -20) apres un run = effort couteux, "
            "tenir compte pour la seance suivante."
        ),
    }


@mcp.tool
def ajustements_du_plan() -> dict[str, Any]:
    """Return the coach adjustments currently overriding the hard-coded plan."""
    db, _ = _plan_write_deps()
    overrides = db.get_plan_overrides()
    return {
        "nombre": len(overrides),
        "ajustements": overrides,
        "rappel": (
            "Ces ajustements sont ceux que le site affiche. Le calendrier de base "
            "est fige dans le code : tout ce qui n'est pas ici n'existe pas pour "
            "le dashboard."
        ),
    }


@mcp.tool
def seance_muscu(routine: str = "Jambe 1", nombre: int = 3) -> dict[str, Any]:
    """Return recent strength training sessions with exercises and weights.

    Utilise ces donnees pour contextualiser la fatigue musculaire des jambes :
    squat lourd ou hack squat veille = jambes chargees sur la sortie du lendemain.
    """
    import db as _db
    sessions = _db.get_workout_sessions(routine_name=routine, limit=nombre)
    return {
        "routine": routine,
        "nombre_sessions": len(sessions),
        "derniere_session": sessions[0] if sessions else None,
        "sessions": sessions,
        "consigne_coach": (
            "Ces seances ne remontent pas dans Garmin. Utilise les poids et volumes "
            "pour estimer la fatigue neuromusculaire des jambes : squat lourd + hack squat "
            "= 48h de recup musculaire avant une qualite ou une longue. "
            "Leg curl lourd = ischio charges -> attention aux cotes et au trail technique."
        ),
    }


@mcp.tool
def ajuster_le_plan(
    jour: str,
    titre: str = "",
    contenu: str = "",
    categorie: str = "easy",
    echauffement: str = "",
    retour_au_calme: str = "",
    tag: str = "",
    note: str = "",
) -> dict[str, Any]:
    """Replace the planned session of one day so the site shows the adjustment.

    `jour` is ISO 'YYYY-MM-DD'. Use categorie='rest' for a rest day (titre and
    contenu are then optional); otherwise both titre and contenu are required.
    Valid categorie values: easy, quality, long, rest, race.
    """
    db, normalize_plan_override = _plan_write_deps()
    day = _normalized_day(jour)
    payload = {
        "title": titre,
        "main": contenu,
        "category": (categorie or "easy").strip().lower(),
        "warmup": echauffement,
        "cooldown": retour_au_calme,
        "tag": tag,
        "note": note,
    }
    session = normalize_plan_override(payload)
    if session is None:
        return {
            "ok": False,
            "jour": day,
            "erreur": (
                "Ajustement inutilisable : fournis un titre ET un contenu, ou "
                "categorie='rest' pour un jour de repos. Rien n'a ete ecrit."
            ),
        }

    db.upsert_plan_override(day, session, note=note, source="coach-mcp")
    return {
        "ok": True,
        "jour": day,
        "seance": session,
        "effet": "Le site affiche cet ajustement des le prochain chargement du plan.",
    }


@mcp.tool
def annuler_ajustement_plan(jour: str) -> dict[str, Any]:
    """Remove the coach adjustment for one day and fall back to the coded plan."""
    db, _ = _plan_write_deps()
    day = _normalized_day(jour)
    removed = db.delete_plan_override(day)
    return {
        "ok": True,
        "jour": day,
        "supprime": removed,
        "effet": (
            "Retour a la seance du calendrier de base."
            if removed
            else "Aucun ajustement n'existait pour ce jour."
        ),
    }


def create_http_app(path: str = "/"):
    """Create an ASGI app exposing the MCP Streamable HTTP endpoint."""
    return mcp.http_app(path=path)
