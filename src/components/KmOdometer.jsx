import React, { useMemo, useState } from 'react'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'

const MILESTONES = [
  // ── 0 → 50 km ──────────────────────────────────────────────────────────────
  { km: 10,      icon: '🏃', label: '10 km',                                   cat: 'race',    desc: 'Le grand classique du dimanche matin.' },
  { km: 21.1,    icon: '🥈', label: 'Semi-marathon',                           cat: 'race',    desc: 'La moitié du marathon. Déjà exceptionnel.' },
  { km: 25,      icon: '🏰', label: 'Paris → Versailles',                      cat: 'geo',     desc: 'Du Trocadéro aux jardins de Versailles. La plus belle banlieue.' },
  { km: 35,      icon: '🏎️', label: 'Initial D — Cols d\'Akina & Irohazaka',  cat: 'game',    desc: 'Takumi Fujiwara dans sa AE86. À fond dans les virages.' },
  { km: 42.2,    icon: '🗼', label: 'Marathon de Paris',                       cat: 'race',    desc: 'Champs-Élysées → Avenue Foch. La distance reine.' },

  // ── 50 → 100 km ─────────────────────────────────────────────────────────────
  { km: 56,      icon: '🦔', label: 'Sonic — Green Hill Zone complète',        cat: 'game',    desc: 'Un aller-retour à travers les anneaux de Green Hill. SEGA !' },
  { km: 70,      icon: '🗡️', label: 'Zelda BotW — Traversée d\'Hyrule',       cat: 'game',    desc: 'Du Plateau du Destin jusqu\'au Château d\'Hyrule. À pied, sans Epona.' },
  { km: 80,      icon: '🎮', label: 'Cyberpunk 2077 — Night City de A à Z',   cat: 'game',    desc: 'Night City entière. Les fixers ne t\'attendent pas, V.' },
  { km: 90,      icon: '🏅', label: 'Comrades Ultra (Afrique du Sud)',         cat: 'race',    desc: 'Durban → Pietermaritzburg. Le plus vieux ultra du monde.' },
  { km: 100,     icon: '🐉', label: 'Skyrim — Province de Bordeciel',          cat: 'game',    desc: '"Fus Ro Dah !" D\'Helgen jusqu\'à Solitude, en évitant les dragons.' },

  // ── 100 → 200 km ────────────────────────────────────────────────────────────
  { km: 115,     icon: '🏛️', label: 'Astérix — Lutèce → Alésia',              cat: 'fiction', desc: 'Par Toutatis, une belle trotte à travers la Gaule.' },
  { km: 125,     icon: '☢️', label: 'Fallout 4 — Le Commonwealth',             cat: 'game',    desc: 'Boston post-nucléaire de bout en bout. War never changes.' },
  { km: 130,     icon: '⚗️', label: 'FMA — Resembool → Central City',         cat: 'fiction', desc: 'Edward Elric quitte son village natal vers la capitale d\'Amestris.' },
  { km: 145,     icon: '🥂', label: 'Paris → Reims',                           cat: 'geo',     desc: 'La ville du sacre et du champagne. Cheers.' },
  { km: 160,     icon: '🌲', label: 'Western States 100 Miles',                cat: 'race',    desc: '161 km, Sierra Nevada, 4 700 m D+. La référence de l\'ultra.' },
  { km: 168,     icon: '🌋', label: 'Diagonale des Fous',                      cat: 'race',    desc: '168 km autour du Piton de la Fournaise, La Réunion.' },
  { km: 171,     icon: '⛰️', label: 'UTMB',                                    cat: 'race',    desc: 'Tour du Mont-Blanc. 10 000 m D+. Le Graal des trailers.' },
  { km: 185,     icon: '🧙', label: 'Bilbo — Bag-End → Rivendell',            cat: 'fiction', desc: 'La première étape du voyage de Bilbon. Les elfes t\'attendent.' },

  // ── 200 → 350 km ────────────────────────────────────────────────────────────
  { km: 200,     icon: '🗺️', label: 'Elden Ring — Terres Intermédiaires',     cat: 'game',    desc: 'De Limgrave jusqu\'aux pics du Farum Azula. Tu n\'es pas mort ?!' },
  { km: 217,     icon: '☀️', label: 'Badwater 135 — Vallée de la Mort',        cat: 'race',    desc: 'Death Valley, 56°C au sol. La course la plus dure de la planète.' },
  { km: 240,     icon: '🧙‍♂️', label: 'Kaamelott — Camelot → Rome',           cat: 'fiction', desc: 'Le Livre V. Arthur sur les routes de l\'Empire. C\'est bon, sire.' },
  { km: 245,     icon: '⌚', label: 'Paris → Genève',                          cat: 'geo',     desc: 'Les montres et la fondue t\'attendent.' },
  { km: 246,     icon: '⚔️', label: 'Spartathlon',                            cat: 'race',    desc: 'Athènes → Sparte. 246 km non-stop. Comme Philippidès en 490 av. J-C.' },
  { km: 250,     icon: '🏜️', label: 'Marathon des Sables',                     cat: 'race',    desc: '6 étapes, 250 km, 38°C. Le plus dur du monde.' },
  { km: 275,     icon: '🦖', label: 'Horizon Zero Dawn — Terrafed',            cat: 'game',    desc: 'Aloy à travers les ruines de Denver et les plaines à machines.' },
  { km: 290,     icon: '⚙️', label: 'Attack on Titan — Entre les 3 murs',     cat: 'fiction', desc: 'Du Mur Maria jusqu\'au Mur Sina. Attention aux Titans Colosses.' },
  { km: 320,     icon: '🦞', label: 'Paris → Rennes',                          cat: 'geo',     desc: 'Bretagne au bout des jambes. Galettes et cidre.' },
  { km: 340,     icon: '🎡', label: 'Paris → Londres',                         cat: 'geo',     desc: 'Sous la Manche et jusqu\'à Big Ben.' },

  // ── 350 → 700 km ────────────────────────────────────────────────────────────
  { km: 385,     icon: '🥐', label: 'Paris → Nantes',                          cat: 'geo',     desc: 'Les Pays de la Loire et le Muscadet t\'attendent.' },
  { km: 420,     icon: '💥', label: 'Dragon Ball — Kame House → Baba\'s Palace', cat: 'fiction', desc: 'Goku à travers le monde des humains. Kaméhaméha !' },
  { km: 465,     icon: '🍽️', label: 'Paris → Lyon',                           cat: 'geo',     desc: 'La capitale gastronomique t\'attend.' },
  { km: 488,     icon: '🥨', label: 'Paris → Strasbourg',                      cat: 'geo',     desc: 'Alsace, forêt noire, choucroute.' },
  { km: 500,     icon: '🏺', label: 'AC Odyssey — Traversée de la Grèce Antique', cat: 'game', desc: 'De Kéfalonie jusqu\'à Athènes et Sparte. Μολὼν λαβέ !' },
  { km: 545,     icon: '🌀', label: 'Naruto — Konoha → Village du Sable',     cat: 'fiction', desc: 'Du Village de la Feuille au Village du Sable. Dattebayo !' },
  { km: 580,     icon: '🍷', label: 'Paris → Bordeaux',                        cat: 'geo',     desc: 'Dans les vignes du Médoc.' },
  { km: 596,     icon: '⛵', label: 'Paris → Brest (aller)',                   cat: 'geo',     desc: 'La moitié du mythique Paris-Brest-Paris.' },
  { km: 650,     icon: '🤠', label: 'Red Dead 2 — L\'Ouest Américain',        cat: 'game',    desc: 'De Blackwater jusqu\'à Saint Denis. Yeehaw.' },

  // ── 700 → 1100 km ───────────────────────────────────────────────────────────
  { km: 750,     icon: '💀', label: 'Mad Max Fury Road — Les Wasteland',      cat: 'fiction', desc: 'À travers le désert australien post-apo. WITNESS ME !' },
  { km: 775,     icon: '⚓', label: 'Paris → Marseille',                       cat: 'geo',     desc: 'Tour Eiffel → Vieux-Port. Bouillabaisse méritée.' },
  { km: 800,     icon: '⚡', label: 'Poudlard Express',                        cat: 'fiction', desc: 'Londres → Écosse. Quai 9¾ compris. Butterbeer au bout.' },
  { km: 870,     icon: '🔮', label: 'The Witcher 3 — Novigrad → Toussaint',  cat: 'game',    desc: 'Geralt sur la Route impériale, cape au vent. Toss a coin.' },
  { km: 900,     icon: '🐌', label: 'Paris → Perpignan',                       cat: 'geo',     desc: 'Le bout de la France métropolitaine. Catalogne en vue.' },
  { km: 930,     icon: '🌊', label: 'Paris → Nice',                           cat: 'geo',     desc: 'La Côte d\'Azur au bout des jambes.' },
  { km: 960,     icon: '🔥', label: 'Demon Slayer — Traversée du Japon',      cat: 'fiction', desc: 'De Sagiri-yama jusqu\'au Pilier de la Flamme. Hinokami Kagura !' },
  { km: 1000,    icon: '📦', label: 'Death Stranding — Première livraison',   cat: 'game',    desc: 'Sam Porter Bridges relie les colonies. Keep on keeping on.' },
  { km: 1050,    icon: '🕊️', label: 'Camino de Santiago',                     cat: 'race',    desc: 'Saint-Jean-Pied-de-Port → Santiago de Compostela.' },
  { km: 1100,    icon: '💍', label: 'Bilbo — Bag-End → Erebor',               cat: 'fiction', desc: 'Le voyage complet jusqu\'à la Montagne Solitaire. Avec les nains.' },

  // ── 1100 → 2000 km ──────────────────────────────────────────────────────────
  { km: 1200,    icon: '🚵', label: 'Paris-Brest-Paris',                      cat: 'race',    desc: '1 200 km aller-retour. La légende du cyclisme, à la course.' },
  { km: 1270,    icon: '🐂', label: 'Paris → Madrid',                         cat: 'geo',     desc: 'La Péninsule Ibérique à la force des mollets.' },
  { km: 1350,    icon: '🧟', label: 'Walking Dead — Atlanta → Washington',    cat: 'fiction', desc: 'À travers une Amérique infestée. Ne cours pas trop vite.' },
  { km: 1420,    icon: '🍕', label: 'Paris → Rome',                           cat: 'geo',     desc: 'Toutes les routes y mènent. Especially yours.' },
  { km: 1500,    icon: '🏴‍☠️', label: 'One Piece — Traversée de l\'East Blue', cat: 'fiction', desc: 'De l\'île Dawn jusqu\'à Loguetown. Les 4 Empereurs t\'attendent.' },
  { km: 1650,    icon: '⭐', label: 'Lucky Luke — Traversée du Far West',     cat: 'fiction', desc: 'Plus vite que son ombre. De Daisy Town jusqu\'au Pacifique.' },
  { km: 1700,    icon: '📖', label: 'Jack Kerouac — Sur la Route',            cat: 'fiction', desc: 'New York → San Francisco. La beat generation à fond.' },
  { km: 1779,    icon: '🌋', label: 'Frodon — La Comté → Mordor',            cat: 'fiction', desc: '"On ne marche pas simplement jusqu\'au Mordor." Sauf toi.' },

  // ── 2000 → 4000 km ──────────────────────────────────────────────────────────
  { km: 2000,    icon: '🌊', label: 'Ulysse — Retour à Ithaque',              cat: 'fiction', desc: 'Troie → Ithaque. 10 ans, des Cyclopes, des Sirènes. Toi c\'est moins.' },
  { km: 2253,    icon: '❄️', label: 'GoT — King\'s Landing → Le Mur',        cat: 'fiction', desc: 'Westeros de bout en bout. Valar Morghulis.' },
  { km: 2400,    icon: '⚗️', label: 'FMA — Traversée complète d\'Amestris',  cat: 'fiction', desc: 'Edward Elric, de Resembool jusqu\'aux Portes du Nord. Équivalence.' },
  { km: 2500,    icon: '🐺', label: 'Le Continent du Sorceleur',              cat: 'fiction', desc: 'Cintra jusqu\'à Nilfgaard. Toss a coin to your runner.' },
  { km: 2850,    icon: '🪆', label: 'Paris → Moscou',                         cat: 'geo',     desc: 'L\'Europe entière sous tes chaussures.' },
  { km: 3000,    icon: '📦', label: 'Death Stranding — USA complète',         cat: 'game',    desc: 'Sam Porter Bridges de la Cité des Chutes à Port Knot City.' },
  { km: 3200,    icon: '✨', label: 'Jojo\'s — Japon vers l\'Égypte',        cat: 'fiction', desc: 'Jotaro Kujo, de Tokyo jusqu\'au Caire. Yare yare daze.' },
  { km: 3400,    icon: '🚴', label: 'Tour de France — Distance totale',       cat: 'race',    desc: '~3 400 km de cols et de pavés. Tour à toi.' },
  { km: 3500,    icon: '🐘', label: 'Hannibal — Carthage → Rome via les Alpes', cat: 'fiction', desc: 'Avec éléphants. 218 av. J.-C. Toi sans éléphants.' },
  { km: 3940,    icon: '🛣️', label: 'Route 66',                               cat: 'geo',     desc: 'Chicago → Los Angeles. L\'Amérique mythique.' },
  { km: 4000,    icon: '🃏', label: 'Forrest Gump — Run across America',      cat: 'fiction', desc: '"Run, Forrest, run !" De la côte Est jusqu\'au Pacifique. Now I\'m tired.' },

  // ── 4000 → 10 000 km ────────────────────────────────────────────────────────
  { km: 4500,    icon: '🗽', label: 'New York → Los Angeles',                 cat: 'geo',     desc: 'Coast to coast. La traversée des États-Unis.' },
  { km: 4800,    icon: '🍁', label: 'Trans-Canada Highway',                    cat: 'geo',     desc: 'St John\'s (Terre-Neuve) → Victoria (C.-B.). Le Canada de A à Z.' },
  { km: 5000,    icon: '🍄', label: 'The Last of Us — USA post-apo',          cat: 'game',    desc: 'Joel & Ellie à travers l\'Amérique dévastée. Toi aussi tu survis.' },
  { km: 5500,    icon: '⛵', label: 'Christophe Colomb — Vers le Nouveau Monde', cat: 'fiction', desc: 'Palos de la Frontera → Bahamas. 1492. La Terre n\'est pas plate.' },
  { km: 5837,    icon: '✈️', label: 'Paris → New York',                      cat: 'geo',     desc: 'Traversée de l\'Atlantique. À la course, évidemment.' },
  { km: 6200,    icon: '🌸', label: 'One Piece — Route vers le Nouveau Monde', cat: 'fiction', desc: 'Mi-chemin de la Grand Line. Fishman Island en vue.' },
  { km: 7200,    icon: '🧭', label: 'Phileas Fogg — 1er quart du Tour',      cat: 'fiction', desc: 'Londres → Bombay. Début du Tour du Monde en 80 Jours. En courant.' },
  { km: 7700,    icon: '🐫', label: 'Marco Polo — Venise → Pékin',            cat: 'fiction', desc: 'La Route de la Soie. Des siècles avant Google Maps.' },
  { km: 9288,    icon: '🚂', label: 'Transsibérien',                          cat: 'geo',     desc: 'Moscou → Vladivostok. 9 fuseaux horaires.' },
  { km: 9700,    icon: '⛩️', label: 'Paris → Tokyo',                         cat: 'geo',     desc: 'L\'autre bout du monde. À pied sec.' },

  // ── 10 000 → 50 000 km ──────────────────────────────────────────────────────
  { km: 10000,   icon: '🌍', label: 'Cap Town → Nordkapp (Cap to Cap)',        cat: 'geo',     desc: 'L\'Afrique du Sud jusqu\'à la pointe nord de la Norvège. L\'axe du monde.' },
  { km: 11000,   icon: '🐋', label: 'Jules Verne — Voyage au Centre de la Terre', cat: 'fiction', desc: 'Reykjavik → Naples (en surface). Le voyage intérieur de Lidenbrock.' },
  { km: 12742,   icon: '🌑', label: 'Diamètre de la Terre',                   cat: 'geo',     desc: 'Assez pour traverser la planète en son centre.' },
  { km: 13000,   icon: '🦅', label: 'Expédition Lewis & Clark',                cat: 'fiction', desc: 'Missouri → Pacifique et retour. 1804-1806. L\'Amérique sauvage.' },
  { km: 17000,   icon: '🦁', label: 'Africa Eco Race — Paris → Dakar legacy', cat: 'race',    desc: 'L\'héritier du Dakar originel. Sable, soleil, et des jambes en acier.' },
  { km: 20000,   icon: '🏴‍☠️', label: 'One Piece — Grand Line complète',      cat: 'fiction', desc: 'De l\'East Blue jusqu\'à Laugh Tale. Tu es le Roi des Pirates.' },
  { km: 28000,   icon: '🌐', label: 'Astro Boy — Tour de la Terre ×0.7',     cat: 'fiction', desc: 'Atom parcourt la planète à la vitesse de la lumière. Toi à la vitesse du trail.' },
  { km: 40000,   icon: '📚', label: 'Phileas Fogg — Tour du Monde en 80 jours', cat: 'fiction', desc: 'Jules Verne. Londres → Londres via Inde, Hong-Kong, Japon, USA.' },
  { km: 40075,   icon: '🌏', label: 'Tour de la Terre — Équateur complet',     cat: 'geo',     desc: 'Le tour complet de l\'équateur terrestre. Légendaire.' },

  // ── Au-delà de la Terre ─────────────────────────────────────────────────────
  { km: 60000,   icon: '⛏️', label: 'Minecraft — Spawn → World Border',       cat: 'game',    desc: 'La limite du monde généré. Au-delà : le void. Et des bugs.' },
  { km: 80000,   icon: '🦑', label: 'Jules Verne — Vingt Mille Lieues sous les Mers', cat: 'fiction', desc: 'Le Nautilus du Capitaine Nemo. Sous les mers du monde entier.' },
  { km: 150000,  icon: '🛸', label: 'Star Wars — Kessel Run partiel',         cat: 'fiction', desc: 'Han Solo a fait le Kessel Run en moins de 12 parsecs. Toi aussi, à l\'échelle.' },
  { km: 384400,  icon: '🌕', label: 'Terre → Lune',                           cat: 'geo',     desc: 'Houston, we have a runner.' },
  { km: 1000000, icon: '🚀', label: '1 000 000 km — L\'ISS en 1,5 jours',    cat: 'geo',     desc: 'La Station Spatiale Internationale parcourt 1M km en moins de 2 jours.' },
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
  return '+ ' + km.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' km'
}

export default function KmOdometer({ totalKm }) {
  const [showAll, setShowAll] = useState(false)
  const [showPassed, setShowPassed] = useState(false)

  const { prev, next, progress, passed, upcoming } = useMemo(() => {
    const passed = MILESTONES.filter(m => m.km <= totalKm)
    const upcoming = MILESTONES.filter(m => m.km > totalKm)
    const prev = passed[passed.length - 1] ?? { km: 0, icon: '🚀', label: 'Départ', cat: 'geo', desc: "L'aventure commence !" }
    const next = upcoming[0] ?? null
    const progress = next ? Math.min(1, (totalKm - prev.km) / (next.km - prev.km)) : 1
    return { prev, next, progress, passed, upcoming }
  }, [totalKm])

  const passedReversed = [...passed].reverse()
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

      {/* Unlocked badge + toggle */}
      {passed.length > 0 && (
        <div className="mb-4 cockpit_odometer_unlocked" data-name="cockpit_odometer_unlocked">
          <div className="flex items-center gap-2 cockpit_odometer_unlocked_row" data-name="cockpit_odometer_unlocked_row">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-txt-muted cockpit_odometer_unlocked_label" data-name="cockpit_odometer_unlocked_label">
              Dernier débloqué
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-lg cockpit_odometer_unlocked_badge" data-name="cockpit_odometer_unlocked_badge">
              <span className="text-base leading-none cockpit_odometer_unlocked_icon" data-name="cockpit_odometer_unlocked_icon">{prev.icon}</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 cockpit_odometer_unlocked_name" data-name="cockpit_odometer_unlocked_name">{prev.label}</span>
              <span className="text-[10px] font-mono text-emerald-500/70 cockpit_odometer_unlocked_km" data-name="cockpit_odometer_unlocked_km">· {fmtKm(prev.km)}</span>
            </div>
            {passed.length > 1 && (
              <button
                type="button"
                onClick={() => setShowPassed(v => !v)}
                className="ml-auto flex items-center gap-1 text-[10px] text-txt-secondary hover:text-txt transition-colors cockpit_odometer_passed_toggle"
                data-name="cockpit_odometer_passed_toggle"
              >
                {showPassed ? <><ChevronUp size={11} /> Masquer</> : <><ChevronDown size={11} /> Voir les {passed.length} débloqués</>}
              </button>
            )}
          </div>

          {/* Full unlocked list */}
          {showPassed && (
            <div className="mt-2 space-y-1 cockpit_odometer_passed_list" data-name="cockpit_odometer_passed_list">
              {passedReversed.map(m => (
                <div key={m.km} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-emerald-500/5 cockpit_odometer_passed_row" data-name={`cockpit_odometer_passed_row_${m.km}`}>
                  <span className="text-emerald-500 text-xs leading-none cockpit_odometer_passed_check" data-name="cockpit_odometer_passed_check">✓</span>
                  <span className="text-base w-5 text-center leading-none cockpit_odometer_passed_icon" data-name="cockpit_odometer_passed_icon">{m.icon}</span>
                  <span className="text-xs text-txt flex-1 min-w-0 truncate cockpit_odometer_passed_name" data-name="cockpit_odometer_passed_name">{m.label}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 cockpit_odometer_passed_cat ${CAT_STYLE[m.cat]}`} data-name="cockpit_odometer_passed_cat">
                    {CAT_LABEL[m.cat]}
                  </span>
                  <span className="text-[10px] font-mono text-txt-muted w-16 text-right shrink-0 cockpit_odometer_passed_km" data-name="cockpit_odometer_passed_km">
                    {fmtKm(m.km)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress track */}
      {next && (
        <>
          <div className="relative pt-5 mb-1 cockpit_odometer_track_wrapper" data-name="cockpit_odometer_track_wrapper">
            <div
              className="absolute top-0 transition-all duration-700 ease-out cockpit_odometer_runner"
              data-name="cockpit_odometer_runner"
              style={{ left: `calc(${Math.max(2, Math.min(96, progress * 100))}% - 9px)` }}
            >
              <span className="text-lg leading-none select-none">🏃</span>
            </div>
            <div className="h-2.5 bg-surface-muted rounded-full overflow-hidden cockpit_odometer_bar_track" data-name="cockpit_odometer_bar_track">
              <div
                className="h-full bg-gradient-to-r from-brand/50 to-brand rounded-full transition-all duration-700 ease-out cockpit_odometer_bar_fill"
                data-name="cockpit_odometer_bar_fill"
                style={{ width: `${Math.max(1, progress * 100)}%` }}
              />
            </div>
          </div>
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

      {/* Footer */}
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
