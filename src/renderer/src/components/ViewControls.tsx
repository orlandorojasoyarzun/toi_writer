import { useI18n } from '../i18n/context'
import { useView } from '../store/view'

export function ViewControls(): React.JSX.Element {
  const { t } = useI18n()
  const { focus, typewriter, toggleFocus, toggleTypewriter } = useView()

  return (
    <div className="view-controls">
      <div className="view-row">
        <span>{t('view.focus')}</span>
        <button
          role="switch"
          aria-checked={focus}
          aria-label={t('view.focus')}
          className="switch"
          onClick={toggleFocus}
        />
      </div>
      <div className="view-row">
        <span>{t('view.typewriter')}</span>
        <button
          role="switch"
          aria-checked={typewriter}
          aria-label={t('view.typewriter')}
          className="switch"
          onClick={toggleTypewriter}
        />
      </div>
    </div>
  )
}
