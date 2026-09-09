import React, { useState, useEffect, useCallback } from 'react'
import { Dumbbell, Plus, ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react'
import Loader from '../components/Loader'

async function fetchMuscu() {
  const r = await fetch('/api/data/muscu')
  if (!r.ok) throw new Error('muscu_fetch_failed')
  return r.json()
}

async function saveMuscu(payload) {
  const r = await fetch('/api/data/muscu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error('muscu_save_failed')
  return r.json()
}

function SetRow({ exIdx, setIdx, set, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2 muscu_set_row" data-name="muscu_set_row">
      <span className="text-xs text-txt-secondary w-5 text-right muscu_set_num">{setIdx + 1}.</span>
      <div className="flex items-center gap-1 muscu_set_weight_group">
        <input
          type="number"
          step="0.5"
          min="0"
          value={set.weight ?? ''}
          onChange={e => onChange(exIdx, setIdx, 'weight', e.target.value === '' ? '' : parseFloat(e.target.value))}
          className="w-16 text-center text-sm font-mono bg-surface border border-surface-border rounded-md px-2 py-1 text-txt muscu_set_weight_input"
          placeholder="kg"
        />
        <span className="text-xs text-txt-secondary">kg</span>
      </div>
      <span className="text-txt-secondary">×</span>
      <div className="flex items-center gap-1 muscu_set_reps_group">
        <input
          type="number"
          min="1"
          value={set.reps ?? ''}
          onChange={e => onChange(exIdx, setIdx, 'reps', e.target.value === '' ? '' : parseInt(e.target.value))}
          className="w-14 text-center text-sm font-mono bg-surface border border-surface-border rounded-md px-2 py-1 text-txt muscu_set_reps_input"
          placeholder="reps"
        />
        <span className="text-xs text-txt-secondary">reps</span>
      </div>
      <button
        onClick={() => onRemove(exIdx, setIdx)}
        className="text-txt-secondary hover:text-danger text-xs ml-auto muscu_set_remove_btn"
        type="button"
      >✕</button>
    </div>
  )
}

function ExerciseCard({ ex, exIdx, onChange, onAddSet, onRemoveSet }) {
  const totalVolume = ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0)
  const maxWeight = ex.sets.length ? Math.max(...ex.sets.map(s => s.weight || 0)) : 0

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-4 muscu_exercise_card" data-name="muscu_exercise_card">
      <div className="flex items-start justify-between mb-3 muscu_exercise_header" data-name="muscu_exercise_header">
        <div>
          <h3 className="font-semibold text-txt text-sm muscu_exercise_name" data-name="muscu_exercise_name">{ex.name}</h3>
          <p className="text-xs text-txt-secondary mt-0.5 muscu_exercise_target">
            {ex.target_sets} séries · {ex.target_reps} reps
          </p>
        </div>
        {maxWeight > 0 && (
          <span className="text-xs font-mono text-brand bg-brand/10 px-2 py-0.5 rounded-full muscu_exercise_max_weight">
            max {maxWeight} kg
          </span>
        )}
      </div>
      <div className="space-y-2 mb-3 muscu_sets_list" data-name="muscu_sets_list">
        {ex.sets.map((set, si) => (
          <SetRow
            key={si}
            exIdx={exIdx}
            setIdx={si}
            set={set}
            onChange={onChange}
            onRemove={onRemoveSet}
          />
        ))}
      </div>
      <div className="flex items-center justify-between muscu_exercise_footer" data-name="muscu_exercise_footer">
        <button
          type="button"
          onClick={() => onAddSet(exIdx)}
          className="flex items-center gap-1 text-xs text-brand hover:text-brand/80 muscu_add_set_btn"
          data-name="muscu_add_set_btn"
        >
          <Plus size={12} /> Ajouter une série
        </button>
        {totalVolume > 0 && (
          <span className="text-xs text-txt-secondary font-mono muscu_volume_total">
            vol. {totalVolume.toLocaleString()} kg
          </span>
        )}
      </div>
    </div>
  )
}

function SessionHistory({ sessions }) {
  const [expanded, setExpanded] = useState(null)
  if (!sessions.length) return null

  return (
    <div className="muscu_history" data-name="muscu_history">
      <h2 className="text-sm font-semibold text-txt-secondary uppercase tracking-wide mb-3 muscu_history_title">
        Historique
      </h2>
      <div className="space-y-2 muscu_history_list" data-name="muscu_history_list">
        {sessions.map((s, i) => (
          <div key={s.id || i} className="bg-surface border border-surface-border rounded-xl overflow-hidden muscu_history_item" data-name="muscu_history_item">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left muscu_history_item_header"
              onClick={() => setExpanded(expanded === i ? null : i)}
              type="button"
            >
              <div className="flex items-center gap-2 muscu_history_item_meta">
                <Clock size={14} className="text-txt-secondary" />
                <span className="text-sm font-medium text-txt muscu_history_date">
                  {new Date(s.session_date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="flex items-center gap-2 muscu_history_item_summary">
                <span className="text-xs text-txt-secondary muscu_history_ex_count">{s.exercises.length} exercices</span>
                {expanded === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>
            {expanded === i && (
              <div className="px-4 pb-3 border-t border-surface-border muscu_history_detail" data-name="muscu_history_detail">
                <div className="mt-3 space-y-2 muscu_history_exercises" data-name="muscu_history_exercises">
                  {s.exercises.map((ex, ei) => (
                    <div key={ei} className="muscu_history_exercise" data-name="muscu_history_exercise">
                      <p className="text-xs font-medium text-txt muscu_history_exercise_name">{ex.name}</p>
                      <p className="text-xs font-mono text-txt-secondary muscu_history_exercise_sets">
                        {ex.sets.map(set => `${set.weight}kg×${set.reps}`).join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
                {s.notes && <p className="text-xs text-txt-secondary mt-2 italic muscu_history_notes">{s.notes}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Muscu() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exercises, setExercises] = useState([])
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMuscu()
      .then(d => {
        setData(d)
        const tpl = (d.template || []).map(ex => ({
          ...ex,
          sets: ex.sets.length > 0 ? ex.sets.map(s => ({ ...s })) : Array.from({ length: ex.target_sets }, () => ({ weight: '', reps: '' })),
        }))
        setExercises(tpl)
      })
      .catch(() => setError('Impossible de charger les données muscu.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSetChange = useCallback((exIdx, setIdx, field, value) => {
    setExercises(prev => prev.map((ex, ei) =>
      ei !== exIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, [field]: value })
      }
    ))
  }, [])

  const handleAddSet = useCallback((exIdx) => {
    setExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex
      const last = ex.sets[ex.sets.length - 1]
      return { ...ex, sets: [...ex.sets, { weight: last?.weight ?? '', reps: last?.reps ?? '' }] }
    }))
  }, [])

  const handleRemoveSet = useCallback((exIdx, setIdx) => {
    setExercises(prev => prev.map((ex, ei) =>
      ei !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
    ))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        session_date: sessionDate,
        routine_name: data?.routine_name || 'Jambe 1',
        exercises: exercises.map(ex => ({
          name: ex.name,
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          sets: ex.sets.filter(s => s.weight !== '' && s.reps !== ''),
        })),
        notes,
      }
      await saveMuscu(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      const refreshed = await fetchMuscu()
      setData(refreshed)
    } catch {
      setError('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  const lastSession = data?.sessions?.[0]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 muscu_page" data-name="muscu_page">
      {/* Header */}
      <div className="flex items-center gap-3 muscu_header" data-name="muscu_header">
        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center muscu_header_icon">
          <Dumbbell size={20} className="text-brand" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-txt muscu_title">Muscu — Jambe 1</h1>
          <p className="text-xs text-txt-secondary muscu_subtitle">
            {lastSession
              ? `Dernière séance : ${new Date(lastSession.session_date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
              : 'Aucune séance enregistrée'}
            {' · '}Hevy
          </p>
        </div>
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-3 muscu_date_row" data-name="muscu_date_row">
        <label className="text-sm text-txt-secondary font-medium muscu_date_label">Date séance</label>
        <input
          type="date"
          value={sessionDate}
          onChange={e => setSessionDate(e.target.value)}
          className="text-sm bg-surface border border-surface-border rounded-lg px-3 py-1.5 text-txt muscu_date_input"
        />
      </div>

      {/* Exercises */}
      <div className="space-y-3 muscu_exercises_list" data-name="muscu_exercises_list">
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.name}
            ex={ex}
            exIdx={i}
            onChange={handleSetChange}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
          />
        ))}
      </div>

      {/* Notes */}
      <div className="muscu_notes_section" data-name="muscu_notes_section">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optionnel) — ressenti, douleurs, charge…"
          rows={2}
          className="w-full text-sm bg-surface border border-surface-border rounded-xl px-4 py-3 text-txt placeholder:text-txt-secondary resize-none muscu_notes_input"
        />
      </div>

      {/* Save button */}
      <div className="muscu_save_section" data-name="muscu_save_section">
        {error && <p className="text-sm text-danger mb-2 muscu_error">{error}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold rounded-xl py-3 disabled:opacity-50 muscu_save_btn"
          data-name="muscu_save_btn"
        >
          {saved ? (
            <><CheckCircle2 size={18} /> Séance enregistrée !</>
          ) : saving ? (
            'Enregistrement…'
          ) : (
            <><Plus size={18} /> Enregistrer la séance</>
          )}
        </button>
      </div>

      {/* History */}
      {data?.sessions?.length > 0 && <SessionHistory sessions={data.sessions} />}
    </div>
  )
}
