import React, { useMemo, useState } from 'react'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'

const MILESTONES = [
  { km: 10,     icon: '🏃', label: '10 km',                              cat: 'race',    desc: 'Le grand classique du dimanche matin.' },
  { km: 21.1,   icon: '🥈', label: 'Semi-marathon',                      cat: 'race',    desc: 'La moitié du marathon. Déjà exceptionnel.' },
  { km: 42.2,   icon: '🗼', label: 'Marathon de Paris',                  cat: 'race',    desc: 'Champs-Élysées → Avenue Foch. La distance reine.' },
  { km: 70,     icon: '🗡️', label: 'Zelda BotW — Traversée d\'Hyrule',  cat: 'game',    desc: 'Du Plateau du Destin jusqu\'au Château d\'Hyrule. À pied, sans cheval.' },
  { km: 100,    icon: '🐉', label: 'Skyrim — Province de Bordeciel',     cat: 'game',    desc: '"Fus Ro Dah !" D\'Helgen jusqu\'à Solitude, en évitant les dragons.' },
  { km: 145,    icon: '🥂', label: 'Paris → Reims',                      cat: 'geo',     desc: 'La ville du sacre et du champagne. Cheers.' },
  { km: 168,    icon: '🌋', label: 'Diagonale des Fous',                 cat: 'race',    desc: '168 km autour du Piton de la Fournaise, La Réunion.' },
  { km: 171,    icon: '⛰️', label: 'UTMB',                               cat: 'race',    desc: 'Tour du Mont-Blanc. 10 000 m D+. Le Graal des trailers.' },
  { km: 185,    icon: '🧙', label: 'Bilbo — Bag-End → Rivendell',       cat: 'fiction', desc: 'La première étape du voyage de Bilbon Sacquet. Les elfes t\'attendent.' },
  { km: 245,    icon: '⌚', label: 'Paris → Genève',                     cat: 'geo',     desc: 'Les montres et la fondue t\'attendent.' },
  { km: 246,    icon: '⚔️', label: 'Spartathlon',                       cat: 'race',    desc: 'Athènes → Sparte. 246 km non-stop. Comme Philippidès.' },
  { km: 250,    icon: '🏜️', label: 'Marathon des Sables',                cat: 'race',    desc: '6 étapes, 250 km, 38°C. Le plus dur du monde.' },
  { km: 340,    icon: '🎡', label: 'Paris → Londres',                    cat: 'geo',     desc: 'Sous la Manche et jusqu\'à Big Ben.' },
  { km: 465,    icon: '🍽️', label: 'Paris → Lyon',                      cat: 'geo',     desc: 'La capitale gastronomique t\'attend.' },
  { km: 580,    icon: '🍷', label: 'Paris → Bordeaux',                   cat: 'geo',     desc: 'Dans les vignes du Médoc.' },
  { km: 650,    icon: '🤠', label: 'Red Dead 2 — L\'Ouest Américain',   cat: 'game',    desc: 'De Blackwater jusqu\'à Saint Denis. Yeehaw.' },
  { km: 775,    icon: '⚓', label: 'Paris → Marseille',                  cat: 'geo',     desc: 'Tour Eiffel → Vieux-Port. Bouillabaisse méritée.' },
  { km: 800,    icon: '⚡', label: 'Poudlard Express',                   cat: 'fiction', desc: 'Londres → Écosse. Quai 9¾ compris. Butterbeer au bout.' },
  { km: 930,    icon: '🌊', label: 'Paris → Nice',                      cat: 'geo',     desc: 'La Côte d\'Azur au bout des jambes.' },
  { km: 1050,   icon: '🕊️', label: 'Camino de Santiago',                cat: 'race',    desc: 'Saint-Jean-Pied-de-Port → Santiago de Compostela.' },
  { km: 1100,   icon: '💍', label: 'Bilbo — Bag-End → Erebor',          cat: 'fiction', desc: 'Le voyage complet jusqu\'à la Montagne Solitaire. Avec les nains.' },
  { km: 1270,   icon: '🐂', label: 'Paris → Madrid',                    cat: 'geo',     desc: 'La Péninsule Ibérique à la force des mollets.' },
  { km: 1420,   icon: '🍕', label: 'Paris → Rome',                      cat: 'geo',     desc: 'Toutes les routes y mènent. Especially yours.' },
  { km: 1779,   icon: '🌋', label: 'Frodon — La Comté → Mordor',       cat: 'fiction', desc: '"On ne marche pas simplement jusqu\'au Mordor." Sauf toi.' },
  { km: 2253,   icon: '❄️', label: 'GoT — King\'s Landing → Le Mur',   cat: 'fiction', desc: 'Westeros de bout en bout. Valar Morghulis.' },
  { km: 2500,   icon: '🐺', label: 'Le Continent du Sorceleur',         cat: 'fiction', desc: 'Cintra jusqu\'à Nilfgaard. Toss a coin to your runner.' },
  { km: 2850,   icon: '🪆', label: 'Paris → Moscou',                    cat: 'geo',     desc: 'L\'Europe entière sous tes chaussures.' },
  { km: 3940,   icon: '🛣️', label: 'Route 66',                          cat: 'geo',     desc: 'Chicago → Los Angeles. L\'Amérique mythique.' },
  { km: 4500,   icon: '🗽', label: 'New York → Los Angeles',            cat: 'geo',     desc: 'Coast to coast. La traversée des États-Unis.' },
  { km: 5000,   icon: '🍄', label: 'The Last of Us — USA post-apo',     cat: 'game',    desc: 'Joel & Ellie à travers l\'Amérique dévastée. Toi aussi tu survis.' },
  { km: 5837,   icon: '✈️', label: 'Paris → New York',                 cat: 'geo',     desc: 'Traversée de l\'Atlantique. À la course, évidemment.' },
  { km: 9288,   icon: '🚂', label: 'Transsibérien',                     cat: 'geo',     desc: 'Moscou → Vladivostok. 9 fuseaux horaires.' },
  { km: 9700,   icon: '⛩️', label: 'Paris → Tokyo',                    cat: 'geo',     desc: 'L\'autre bout du monde. À pied sec.' },
  { km: 12742,  icon: '🌍', label: 'Diamètre de la Terre',              cat: 'geo',     desc: 'Assez pour traverser la planète en son centre.' },
  { km: 40075,  icon: '🌏', label: 'Tour de la Terre',                  cat: 'geo',     desc: 'Le tour complet de l\'équateur terrestre. Légendaire.' },
  { km: 384400, icon: '🌕', label: 'Terre → Lune',                      cat: 'geo',     desc: 'Houston, we have a runner.' },
]

const CAT_STYLE = {
  race:    'text-orange-500 bg-orange-500/10',
  game:    'text-violet-500 bg-violet-500/10',
  fiction: 'text-indigo-500 bg-indigo-500/10',
  geo:     'text-emerald-500 bg-emerald-500/10',
}

const CAT_LABEL = {
  race:    'Course',
  game:    'Jeu vidéo',
  fiction: 'Fiction',
  geo:     'Géographie',
}

function fmtKm(km) {
  if (km >= 1000) {
    return km.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' km'
  }
  return (Math.round(km * 10) / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' km'
}

function fmtDelta(km) {
  return '+ ' + km.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' km'
}

export default function KmOdometer({ totalKm }) {
  const [showAll, setShowAll] = useState(false)

  const { prev, next, progress, passed, upcoming } = useMemo(() => {
    const passed = MILESTONES.filter(m => m.km <= totalKm)
    const upcoming = MILESTONES.filter(m => m.km > totalKm)
    const prev = passed[passed.length - 1] ?? { km: 0, icon: '🚀', label: 'Départ', cat: 'geo', desc: 'L\'aventure commence !' }
    const next = upcoming[0] ?? null
    const progress = next ? Math.min(1, (totalKm - prev.km) / (next.km - prev.km)) : 1
    return { prev, next, progress, passed, upcoming }
  }, [totalKm])

  const previewUpcoming = upcoming.slice(1, 5)
  const extraUpcoming = upcoming.slice(5)

  if (totalKm <= 0) return null

  return (
    <div className="card cockpit_odometer mb-4 sm:mb-6" data-name="cockpit_odometer">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 cockpit_odometer_header" data-name="cockpit_odometer_header">
        <div className="flex items-center gap-2 cockpit_odometer_title_group" data-name="cockpit_odometer_title_group">
          <MapPin size={15} className="text-brand cockpit_odometer_icon" data-name="cockpit_odometer_icon" />
          <h3 className="text-sm font-medium text-txt-secondary cockpit_odometer_title" data-name="cockpit_odometer_title">Ton odyssée</h3>
        </div>
        <div className="text-right cockpit_odometer_total" data-name="cockpit_odometer_total">
          <span className="text-xl font-mono font-bold text-txt cockpit_odometer_total_value" data-name="cockpit_odometer_total_value">
            {Math.round(totalKm).toLocaleString('fr-FR')}
          </span>
          <span className="text-xs text-txt-secondary ml-1 cockpit_odometer_total_unit" data-name="cockpit_odometer_total_unit">km parcourus</span>
        </div>
      </div>

      {/* Unlocked badge */}
      {passed.length > 0 && (
        <div className="flex items-center gap-2 mb-4 cockpit_odometer_unlocked" data-name="cockpit_odometer_unlocked">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-txt-muted cockpit_odometer_unlocked_label" data-name="cockpit_odometer_unlocked_label">
            Débloqué
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-lg cockpit_odometer_unlocked_badge" data-name="cockpit_odometer_unlocked_badge">
            <span className="text-base leading-none cockpit_odometer_unlocked_icon" data-name="cockpit_odometer_unlocked_icon">{prev.icon}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 cockpit_odometer_unlocked_name" data-name="cockpit_odometer_unlocked_name">{prev.label}</span>
            <span className="text-[10px] font-mono text-emerald-500/70 cockpit_odometer_unlocked_km" data-name="cockpit_odometer_unlocked_km">· {fmtKm(prev.km)}</span>
          </div>
        </div>
      )}

      {/* Progress track */}
      {next && (
        <>
          <div className="relative pt-5 mb-1 cockpit_odometer_track_wrapper" data-name="cockpit_odometer_track_wrapper">
            {/* Runner emoji above bar */}
            <div
              className="absolute top-0 transition-all duration-700 ease-out cockpit_odometer_runner"
              data-name="cockpit_odometer_runner"
              style={{ left: `calc(${Math.max(2, Math.min(96, progress * 100))}% - 9px)` }}
            >
              <span className="text-lg leading-none select-none">🏃</span>
            </div>
            {/* Bar */}
            <div className="h-2.5 bg-surface-muted rounded-full overflow-hidden cockpit_odometer_bar_track" data-name="cockpit_odometer_bar_track">
              <div
                className="h-full bg-gradient-to-r from-brand/50 to-brand rounded-full transition-all duration-700 ease-out cockpit_odometer_bar_fill"
                data-name="cockpit_odometer_bar_fill"
                style={{ width: `${Math.max(1, progress * 100)}%` }}
              />
            </div>
          </div>
          {/* Distance markers below bar */}
          <div className="flex items-center justify-between text-[10px] font-mono mb-4 cockpit_odometer_bar_labels" data-name="cockpit_odometer_bar_labels">
            <span className="text-txt-muted cockpit_odometer_bar_from" data-name="cockpit_odometer_bar_from">{fmtKm(prev.km)}</span>
            <span className="text-brand font-semibold cockpit_odometer_bar_remaining" data-name="cockpit_odometer_bar_remaining">
              encore {fmtKm(next.km - totalKm)}
            </span>
            <span className="text-txt-muted cockpit_odometer_bar_to" data-name="cockpit_odometer_bar_to">{fmtKm(next.km)}</span>
          </div>

          {/* Next milestone card */}
          <div className="flex items-start gap-3 p-3 bg-brand/5 border border-brand/10 rounded-xl mb-4 cockpit_odometer_next" data-name="cockpit_odometer_next">
            <span className="text-3xl leading-none mt-0.5 cockpit_odometer_next_icon" data-name="cockpit_odometer_next_icon">{next.icon}</span>
            <div className="flex-1 min-w-0 cockpit_odometer_next_body" data-name="cockpit_odometer_next_body">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap cockpit_odometer_next_top" data-name="cockpit_odometer_next_top">
                <span className="text-sm font-semibold text-txt cockpit_odometer_next_name" data-name="cockpit_odometer_next_name">{next.label}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full cockpit_odometer_next_cat ${CAT_STYLE[next.cat]}`} data-name="cockpit_odometer_next_cat">
                  {CAT_LABEL[next.cat]}
                </span>
              </div>
              <p className="text-xs text-txt-secondary leading-snug cockpit_odometer_next_desc" data-name="cockpit_odometer_next_desc">{next.desc}</p>
              <p className="text-[11px] font-semibold text-brand mt-1.5 cockpit_odometer_next_cta" data-name="cockpit_odometer_next_cta">
                Encore {fmtKm(next.km - totalKm)} à parcourir →
              </p>
            </div>
          </div>
        </>
      )}

      {/* Upcoming milestones list */}
      {previewUpcoming.length > 0 && (
        <div className="space-y-1 cockpit_odometer_upcoming" data-name="cockpit_odometer_upcoming">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-txt-muted mb-2 cockpit_odometer_upcoming_title" data-name="cockpit_odometer_upcoming_title">
            Prochains paliers
          </div>
          {[...previewUpcoming, ...(showAll ? extraUpcoming : [])].map(m => (
            <div key={m.km} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-muted/50 transition-colors cockpit_odometer_upcoming_row" data-name={`cockpit_odometer_upcoming_row_${m.km}`}>
              <span className="text-base w-6 text-center leading-none cockpit_odometer_upcoming_icon" data-name="cockpit_odometer_upcoming_icon">{m.icon}</span>
              <span className="text-xs text-txt flex-1 min-w-0 truncate cockpit_odometer_upcoming_name" data-name="cockpit_odometer_upcoming_name">{m.label}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 cockpit_odometer_upcoming_cat ${CAT_STYLE[m.cat]}`} data-name="cockpit_odometer_upcoming_cat">
                {CAT_LABEL[m.cat]}
              </span>
              <span className="text-[10px] font-mono font-semibold text-brand w-20 text-right shrink-0 cockpit_odometer_upcoming_delta" data-name="cockpit_odometer_upcoming_delta">
                {fmtDelta(m.km - totalKm)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer: progress count + toggle */}
      <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between cockpit_odometer_footer" data-name="cockpit_odometer_footer">
        <span className="text-[10px] text-txt-muted cockpit_odometer_count" data-name="cockpit_odometer_count">
          {passed.length} / {MILESTONES.length} paliers débloqués
        </span>
        {extraUpcoming.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(v => !v)}
            className="flex items-center gap-1 text-[10px] text-txt-secondary hover:text-txt transition-colors cockpit_odometer_toggle" data-name="cockpit_odometer_toggle"
          >
            {showAll
              ? <><ChevronUp size={11} /> Réduire</>
              : <><ChevronDown size={11} /> +{extraUpcoming.length} paliers</>
            }
          </button>
        )}
      </div>
    </div>
  )
}
