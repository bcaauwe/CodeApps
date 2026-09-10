import { useEffect, useRef, useState } from 'react'
import {
  Badge, Button, Card, FluentProvider, Input, ProgressBar, Textarea, createLightTheme,
} from '@fluentui/react-components'
import {
  ArrowLeft24Regular, ArrowRight24Regular, BarcodeScanner24Regular, Camera24Regular,
  CheckmarkCircle24Filled, Checkmark24Regular, CloudArrowUp24Regular, Mic24Filled,
  Mic24Regular, Receipt24Regular, VehicleTruckProfile24Regular, Warning24Filled,
  WeatherSunny24Regular, WifiOff24Regular,
} from '@fluentui/react-icons'
import type { IScannerControls } from '@zxing/browser'
import './App.css'

const yardTheme = createLightTheme({
  10: '#020202', 20: '#15110b', 30: '#292015', 40: '#3e2e1c', 50: '#543d23',
  60: '#6b4c2a', 70: '#835c31', 80: '#9c6d38', 90: '#b67e40', 100: '#d09049',
  110: '#e9a252', 120: '#f4b66c', 130: '#f8ca8d', 140: '#fbdbb1', 150: '#fdedd6', 160: '#fff9f0',
})

type Step = 'scan' | 'capture' | 'review' | 'success'
type CaptureType = 'damage' | 'meter' | 'receipt'
type Capture = { id: string; type: CaptureType; imageUrl: string; title: string; result: string; confidence: number }
type SpeechRecognitionInstance = {
  continuous: boolean; interimResults: boolean; lang: string; start: () => void; stop: () => void
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

const stepOrder: Step[] = ['scan', 'capture', 'review', 'success']

function App() {
  const [step, setStep] = useState<Step>('scan')
  const [assetId, setAssetId] = useState('')
  const [captures, setCaptures] = useState<Capture[]>([])
  const [activeCapture, setActiveCapture] = useState<CaptureType>('damage')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const [audioNote, setAudioNote] = useState<File | null>(null)
  const [meterReading, setMeterReading] = useState('')
  const [fuelAmount, setFuelAmount] = useState('0.00')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [returnId, setReturnId] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerControlsRef = useRef<IScannerControls | null>(null)
  const scanTimeoutRef = useRef<number | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const finalSpeechSegmentsRef = useRef<string[]>([])
  const currentIndex = stepOrder.indexOf(step)

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
      scannerControlsRef.current?.stop()
      if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const stopCamera = () => {
    scannerControlsRef.current?.stop()
    scannerControlsRef.current = null
    if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current)
    scanTimeoutRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  const startCamera = async (forBarcode = false) => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
      window.setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          if (forBarcode) void detectBarcode(stream, videoRef.current)
        }
      }, 50)
    } catch {
      setCameraError('Camera access is unavailable. Check device permissions or use the manual fallback.')
    }
  }

  const detectBarcode = async (stream: MediaStream, video: HTMLVideoElement) => {
    const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
      import('@zxing/browser'),
      import('@zxing/library'),
    ])
    const formats = [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
    ]
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
    hints.set(DecodeHintType.TRY_HARDER, true)
    const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 120, delayBetweenScanSuccess: 500 })

    try {
      scannerControlsRef.current = await reader.decodeFromStream(stream, video, (result) => {
        if (!result) return
        const value = result.getText().trim()
        if (!value) return
        setAssetId(value)
        setCameraError('')
        stopCamera()
      })
      scanTimeoutRef.current = window.setTimeout(() => {
        setCameraError('Still scanning. Fill the tag inside the frame, hold steady, and avoid glare—or enter the asset ID manually.')
      }, 12000)
    } catch {
      setCameraError('The scanner could not start in Power Apps. Check camera permissions or enter the asset ID manually.')
    }
  }

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageUrl = canvas.toDataURL('image/jpeg', 0.82)
    const damageCount = captures.filter((item) => item.type === 'damage').length
    const sample = activeCapture === 'damage'
      ? { title: `Damage photo ${damageCount + 1}`, result: damageCount ? 'Hydraulic hose wear' : 'Front-left tire low', confidence: damageCount ? 0.68 : 0.94 }
      : activeCapture === 'meter'
        ? { title: 'Hour meter', result: '247.6 hrs', confidence: 0.98 }
        : { title: 'Fuel receipt', result: '$78.40', confidence: 0.97 }
    setCaptures((items) => [...items, { id: crypto.randomUUID(), type: activeCapture, imageUrl, ...sample }])
    if (activeCapture === 'meter') setMeterReading('247.6')
    if (activeCapture === 'receipt') setFuelAmount('78.40')
    stopCamera()
  }

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    setVoiceError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      const speechWindow = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
      const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setVoiceError('Live transcription is not available in this Power Apps mobile view. Use “Record with phone” or type the note.')
        return
      }
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      finalSpeechSegmentsRef.current = []
      setTranscript('')
      recognition.onresult = (event) => {
        let interim = ''
        const finalSegments: string[] = []

        for (const result of Array.from(event.results)) {
          const phrase = result[0].transcript.trim()
          if (!phrase) continue
          if (result.isFinal) finalSegments.push(phrase)
          else interim = phrase
        }

        for (const phrase of finalSegments) {
          const normalized = phrase.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
          const matchingIndex = finalSpeechSegmentsRef.current.findIndex((saved) => {
            const savedNormalized = saved.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
            return savedNormalized === normalized || normalized.startsWith(`${savedNormalized} `) || savedNormalized.startsWith(`${normalized} `)
          })
          if (matchingIndex < 0) {
            finalSpeechSegmentsRef.current.push(phrase)
          } else {
            const savedNormalized = finalSpeechSegmentsRef.current[matchingIndex]
              .toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
            if (normalized.length > savedNormalized.length) finalSpeechSegmentsRef.current[matchingIndex] = phrase
          }
        }

        const finalText = finalSpeechSegmentsRef.current.join(' ')
        const normalizedInterim = interim.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
        const interimAlreadyFinal = finalSpeechSegmentsRef.current.some(
          (saved) => saved.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === normalizedInterim,
        )
        setTranscript([finalText, interimAlreadyFinal ? '' : interim].filter(Boolean).join(' '))
      }
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
    } catch {
      setVoiceError('Microphone access was denied. Enable Microphone for Microsoft Power Apps in the phone settings, or use “Record with phone”.')
    }
  }

  const captureAudioNote = (file: File | undefined) => {
    if (!file) return
    setAudioNote(file)
    setVoiceError('')
  }

  const startCapture = (type: CaptureType) => { setActiveCapture(type); void startCamera() }

  const confirmReturn = () => {
    const id = `RET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const payload = {
      id, assetId, meterReading, fuelAmount, transcript,
      audioNote: audioNote ? { name: audioNote.name, type: audioNote.type, size: audioNote.size } : null,
      damageFlags: captures.filter((item) => item.type === 'damage').map(({ result, confidence }) => ({ category: result, confidence })),
      capturedAt: new Date().toISOString(), syncStatus: isOnline ? 'ready' : 'queued',
    }
    if (!isOnline) {
      const queue = JSON.parse(localStorage.getItem('yardCheckinQueue') || '[]')
      localStorage.setItem('yardCheckinQueue', JSON.stringify([...queue, payload]))
    }
    setReturnId(id)
    setStep('success')
  }

  const reset = () => {
    setStep('scan'); setAssetId(''); setCaptures([]); setTranscript(''); setVoiceError(''); setAudioNote(null); setMeterReading(''); setFuelAmount('0.00'); setReturnId('')
  }

  return (
    <FluentProvider theme={yardTheme} className="app-provider">
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-mark"><VehicleTruckProfile24Regular /></div>
          <div><strong>Summit Yard</strong><span>Equipment returns</span></div>
          <div className="topbar-spacer" />
          <Badge appearance="tint" color={isOnline ? 'success' : 'warning'} icon={isOnline ? <CloudArrowUp24Regular /> : <WifiOff24Regular />}>
            {isOnline ? 'Online · Ready to sync' : 'Offline · Saving locally'}
          </Badge>
          <div className="weather"><WeatherSunny24Regular /><span>78°</span></div>
          <div className="avatar">DS</div>
        </header>

        <div className="workspace">
          <aside className="sidebar">
            <p className="eyebrow">RETURN CHECK-IN</p>
            <h1>{step === 'success' ? 'Return complete' : assetId || 'New return'}</h1>
            <p className="sidebar-copy">One walk-around. Capture everything before the customer leaves.</p>
            <nav className="steps" aria-label="Check-in progress">
              {(['scan', 'capture', 'review'] as Step[]).map((item, index) => (
                <div className={`step-item ${step === item ? 'active' : ''} ${currentIndex > index ? 'done' : ''}`} key={item}>
                  <span>{currentIndex > index ? <Checkmark24Regular /> : index + 1}</span>
                  <div><strong>{item === 'scan' ? 'Identify equipment' : item === 'capture' ? 'Walk-around capture' : 'Review & confirm'}</strong><small>{item === 'scan' ? 'Scan the asset tag' : item === 'capture' ? 'Photos, meter & voice' : 'You have final say'}</small></div>
                </div>
              ))}
            </nav>
            <div className="safety-note"><Warning24Filled /><span><strong>Stay aware</strong>Keep clear of moving equipment while using the camera.</span></div>
          </aside>

          <main className="main-content">
            {step !== 'success' && <ProgressBar value={(currentIndex + 1) / 3} thickness="large" />}

            {step === 'scan' && (
              <section className="screen scan-screen">
                <div className="screen-heading"><p className="eyebrow">STEP 1 OF 3</p><h2>Identify the equipment</h2><p>Point the rear camera at the QR code or barcode on the asset tag.</p></div>
                <div className="scan-layout">
                  <Card className="scanner-card">
                    {cameraOpen ? (
                      <div className="camera-stage"><video ref={videoRef} muted playsInline /><div className="scan-frame"><i /><i /><i /><i /></div><Badge className="camera-label">Looking for a tag…</Badge></div>
                    ) : (
                      <div className="scanner-empty"><div className="scanner-icon"><BarcodeScanner24Regular /></div><h3>Ready to scan</h3><p>Hold the tablet 6–12 inches from the equipment tag.</p><Button appearance="primary" size="large" icon={<Camera24Regular />} onClick={() => void startCamera(true)}>Open scanner</Button></div>
                    )}
                    {cameraError && <p className="inline-warning"><Warning24Filled />{cameraError}</p>}
                  </Card>
                  <div className="manual-card"><span>TAG DAMAGED?</span><h3>Enter the asset ID</h3><p>Use this only when the barcode cannot be read.</p><Input size="large" value={assetId} onChange={(_, data) => setAssetId(data.value.toUpperCase())} placeholder="e.g. TH-4471" /><Button appearance="subtle" onClick={() => setAssetId('TH-4471')}>Use demo equipment</Button></div>
                </div>
                {assetId && <Card className="asset-found"><CheckmarkCircle24Filled /><div><span>EQUIPMENT FOUND</span><h3>{assetId} · JLG 600S Boom Lift</h3><p>Rental #RA-20981 · Contoso Construction · Due today</p></div><Button appearance="primary" size="large" icon={<ArrowRight24Regular />} iconPosition="after" onClick={() => { stopCamera(); setStep('capture') }}>Start walk-around</Button></Card>}
              </section>
            )}

            {step === 'capture' && (
              <section className="screen">
                <div className="screen-heading heading-row"><div><p className="eyebrow">STEP 2 OF 3 · {assetId}</p><h2>Capture as you walk</h2><p>Take each photo once. The app reads the details while you inspect.</p></div><Badge appearance="filled" color="brand">{captures.length} captured</Badge></div>
                {cameraOpen ? (
                  <Card className="live-camera"><video ref={videoRef} muted playsInline /><div className="camera-hud"><Badge appearance="filled">{activeCapture === 'damage' ? 'Damage photo' : activeCapture === 'meter' ? 'Hour meter' : 'Fuel receipt'}</Badge><Button appearance="primary" shape="circular" size="large" aria-label="Take photo" icon={<Camera24Regular />} onClick={takePhoto} /><Button appearance="secondary" onClick={stopCamera}>Cancel</Button></div></Card>
                ) : (
                  <div className="capture-grid">
                    <CaptureCard icon={<Camera24Regular />} title="Damage photos" description="Add every visible issue" count={captures.filter((c) => c.type === 'damage').length} required onClick={() => startCapture('damage')} />
                    <CaptureCard icon={<VehicleTruckProfile24Regular />} title="Hour meter" description={meterReading ? `${meterReading} hrs read` : 'Photograph the full display'} count={captures.filter((c) => c.type === 'meter').length} required onClick={() => startCapture('meter')} />
                    <CaptureCard icon={<Receipt24Regular />} title="Fuel receipt" description={fuelAmount !== '0.00' ? `$${fuelAmount} read` : 'Optional when returned full'} count={captures.filter((c) => c.type === 'receipt').length} onClick={() => startCapture('receipt')} />
                    <Card className={`voice-card ${isListening ? 'recording' : ''}`}>
                      <div className="capture-icon voice"><Mic24Regular /></div>
                      <div className="capture-copy"><span>VOICE NOTES</span><h3>{isListening ? 'Listening…' : audioNote ? 'Audio note captured' : 'Condition notes'}</h3><p>{audioNote ? `${audioNote.name} · ${Math.max(1, Math.round(audioNote.size / 1024))} KB` : transcript || 'Speak naturally while inspecting.'}</p></div>
                      <div className="voice-actions">
                        <Button appearance={isListening ? 'primary' : 'secondary'} size="large" icon={isListening ? <Mic24Filled /> : <Mic24Regular />} onClick={() => void toggleListening()}>{isListening ? 'Stop' : transcript ? 'Transcribe again' : 'Live transcription'}</Button>
                        <Button appearance="secondary" size="large" icon={<Mic24Regular />} onClick={() => audioInputRef.current?.click()}>Record with phone</Button>
                        <input ref={audioInputRef} className="visually-hidden" type="file" accept="audio/*" capture="user" onChange={(event) => captureAudioNote(event.target.files?.[0])} />
                      </div>
                      {voiceError && <p className="voice-warning"><Warning24Filled />{voiceError}</p>}
                      <Textarea className="voice-fallback" resize="vertical" value={transcript} onChange={(_, data) => setTranscript(data.value)} placeholder="Type a note if transcription is unavailable" aria-label="Condition note fallback" />
                    </Card>
                  </div>
                )}
                {cameraError && <p className="inline-warning"><Warning24Filled />{cameraError}</p>}
                <div className="screen-actions"><Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => setStep('scan')}>Back</Button><Button appearance="primary" size="large" icon={<ArrowRight24Regular />} iconPosition="after" disabled={!meterReading || captures.filter((c) => c.type === 'damage').length === 0} onClick={() => setStep('review')}>Review check-in</Button></div>
              </section>
            )}

            {step === 'review' && (
              <section className="screen review-screen">
                <div className="screen-heading heading-row"><div><p className="eyebrow">STEP 3 OF 3 · HUMAN CONFIRMATION</p><h2>Review what the app found</h2><p>AI suggestions are highlighted. Correct anything before saving.</p></div><Badge appearance="tint" color="success" icon={<Checkmark24Regular />}>Ready to confirm</Badge></div>
                <div className="review-layout">
                  <div className="summary-stack">
                    <Card className="summary-card"><div className="summary-title"><VehicleTruckProfile24Regular /><div><span>EQUIPMENT</span><h3>{assetId} · JLG 600S Boom Lift</h3><p>Contoso Construction · Rental #RA-20981</p></div></div></Card>
                    <Card className="summary-card"><div className="summary-title"><Camera24Regular /><div><span>DAMAGE DETECTION</span><h3>{captures.filter((c) => c.type === 'damage').length} condition flags</h3></div></div><div className="damage-list">{captures.filter((c) => c.type === 'damage').map((capture) => <div className="damage-row" key={capture.id}><img src={capture.imageUrl} alt={capture.title} /><div><strong>{capture.result}</strong><small>{Math.round(capture.confidence * 100)}% confidence</small></div>{capture.confidence < .7 ? <Badge color="warning" icon={<Warning24Filled />}>Review photo</Badge> : <Badge color="success">High confidence</Badge>}</div>)}</div></Card>
                    <Card className="summary-card"><div className="field-grid"><label><span>HOUR METER · OCR</span><Input size="large" value={meterReading} onChange={(_, data) => setMeterReading(data.value)} contentAfter="hrs" /></label><label><span>FUEL AMOUNT · DOCUMENT</span><Input size="large" value={fuelAmount} onChange={(_, data) => setFuelAmount(data.value)} contentBefore="$" /></label></div></Card>
                    <Card className="summary-card"><label className="notes-field"><span><Mic24Regular /> VOICE NOTE · TRANSCRIPT</span><Textarea resize="vertical" value={transcript} onChange={(_, data) => setTranscript(data.value)} placeholder="No voice note captured" /></label></Card>
                  </div>
                  <aside className="confirm-panel"><div className="confirm-check"><CheckmarkCircle24Filled /></div><h3>Everything look right?</h3><p>Confirming creates the condition log and prepares {captures.length} attachments for sync.</p><div className="confirm-facts"><span><Checkmark24Regular /> Asset identified</span><span><Checkmark24Regular /> Meter verified</span><span><Checkmark24Regular /> Damage documented</span><span><Checkmark24Regular /> Inspector: Dana Scott</span></div>{!isOnline && <div className="offline-callout"><WifiOff24Regular /><span><strong>You’re offline</strong>This return will be queued safely on this device.</span></div>}<Button appearance="primary" size="large" icon={<Checkmark24Regular />} onClick={confirmReturn}>Confirm equipment return</Button><small>Nothing is saved until you confirm.</small></aside>
                </div>
                <div className="screen-actions"><Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => setStep('capture')}>Back to capture</Button></div>
              </section>
            )}

            {step === 'success' && (
              <section className="success-screen"><div className="success-icon"><Checkmark24Regular /></div><p className="eyebrow">RETURN CHECKED IN</p><h2>{assetId} is complete</h2><p>{isOnline ? 'The condition log is ready to sync with yard operations.' : 'This check-in is safely stored and will sync automatically when the connection returns.'}</p><Card className="receipt-card"><div><span>RETURN EVENT</span><strong>{returnId}</strong></div><div><span>CHECKED IN</span><strong>{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong></div><div><span>STATUS</span><Badge color={isOnline ? 'success' : 'warning'}>{isOnline ? 'Ready to sync' : 'Queued offline'}</Badge></div></Card><Button appearance="primary" size="large" icon={<VehicleTruckProfile24Regular />} onClick={reset}>Check in next equipment</Button></section>
            )}
          </main>
        </div>
      </div>
      <canvas ref={canvasRef} hidden />
    </FluentProvider>
  )
}

function CaptureCard({ icon, title, description, count, required, onClick }: { icon: React.ReactNode; title: string; description: string; count: number; required?: boolean; onClick: () => void }) {
  return <Card className={`capture-card ${count ? 'complete' : ''}`}><div className="capture-icon">{count ? <Checkmark24Regular /> : icon}</div><div className="capture-copy"><span>{required ? 'REQUIRED' : 'OPTIONAL'}</span><h3>{title}</h3><p>{description}</p></div><Button appearance={count ? 'secondary' : 'primary'} size="large" icon={<Camera24Regular />} onClick={onClick}>{count ? 'Add another' : 'Capture'}</Button></Card>
}

export default App
