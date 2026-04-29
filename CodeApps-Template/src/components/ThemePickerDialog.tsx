import { Button, makeStyles, tokens, Label, shorthands } from '@fluentui/react-components'
import { DismissRegular } from '@fluentui/react-icons'
import { useState, useEffect } from 'react'
import PickerOverlay from 'react-pick-color'
import { useTheme } from '../hooks/useTheme'

const useStyles = makeStyles({
  sidecarContainer: {
    position: 'fixed',
    top: '64px',
    right: 0,
    height: 'calc(100vh - 64px)',
    width: '400px',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: '0 0 28px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    '@media (max-width: 768px)': {
      width: '100%',
    },
  },
  sidecarOpen: {
    transform: 'translateX(0)',
  },
  sidecarOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'none',
  },
  sidecarOverlayOpen: {
    display: 'block',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('16px', '24px'),
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
    ...shorthands.padding('24px'),
    overflow: 'auto',
    flex: 1,
  },
  colorPickerSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  colorInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
  colorInput: {
    width: '80px',
    height: '40px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    cursor: 'pointer',
  },
  colorHexInput: {
    flex: 1,
    padding: '8px 12px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    fontSize: tokens.fontSizeBase300,
  },
  colorPickerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    ...shorthands.padding('16px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    paddingTop: '8px',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  previewBox: {
    width: '100%',
    height: '60px',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  footer: {
    display: 'flex',
    ...shorthands.gap('8px'),
    ...shorthands.padding('16px', '24px'),
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    justifyContent: 'flex-end',
  },
})

interface ThemePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ThemePickerModal({ open, onOpenChange }: ThemePickerModalProps) {
  const styles = useStyles()
  const { primaryColor, setPrimaryColor } = useTheme()
  const [tempColor, setTempColor] = useState(primaryColor)

  useEffect(() => {
    setTempColor(primaryColor)
  }, [primaryColor, open])

  const handleColorChange = (color: string) => {
    setTempColor(color)
  }

  const handleApply = () => {
    setPrimaryColor(tempColor)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTempColor(primaryColor)
    onOpenChange(false)
  }

  return (
    <>
      {open && (
        <div 
          className={`${styles.sidecarOverlay} ${styles.sidecarOverlayOpen}`}
          onClick={handleCancel}
        />
      )}
      
      <div className={`${styles.sidecarContainer} ${open ? styles.sidecarOpen : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Theme Color Picker</h2>
          <Button
            icon={<DismissRegular />}
            appearance="subtle"
            onClick={handleCancel}
            title="Close"
          />
        </div>

        {/* Content */}
        <div className={styles.container}>
          {/* Color Picker */}
          <div className={styles.colorPickerSection}>
            <Label>Color Picker</Label>
            <div className={styles.colorPickerWrapper}>
              <PickerOverlay
                color={tempColor}
                onChange={(color: { hex: string }) => handleColorChange(color.hex)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button appearance="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button appearance="primary" onClick={handleApply}>
            Apply Theme
          </Button>
        </div>
      </div>
    </>
  )
}
