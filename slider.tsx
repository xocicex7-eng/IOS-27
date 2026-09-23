import { useState, useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps {
  value: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  disabled?: boolean
  className?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  disabled,
  className,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const percentage = ((value - min) / (max - min)) * 100

  const updateValue = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const next = min + ratio * (max - min)
      const stepped = Math.round(next / step) * step
      onChange?.(Math.max(min, Math.min(max, stepped)))
    },
    [min, max, step, onChange]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateValue(e.clientX)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, updateValue])

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {showValue && (
            <span className="text-xs text-muted-foreground tabular-nums">{value}</span>
          )}
        </div>
      )}
      <div ref={trackRef} className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          role="slider"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={label}
          tabIndex={disabled ? -1 : 0}
          onMouseDown={handleMouseDown}
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white shadow ring-2 ring-ring transition-transform',
            isDragging && 'scale-110',
            disabled && 'pointer-events-none opacity-50'
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  )
}