import { useEffect, useRef, useState } from 'react'
import {
  Badge, Button, Card, Input, ProgressBar, Radio, RadioGroup, Spinner, Textarea,
} from '@fluentui/react-components'
import {
  ArrowLeft24Regular, ArrowRight24Regular, BarcodeScanner24Regular, Camera24Regular,
  CheckmarkCircle24Filled, Checkmark24Regular, Mic24Filled,
  Delete24Regular, Mic24Regular, Person24Regular, Receipt24Regular, Search24Regular, Send24Regular, VehicleTruckProfile24Regular, Video24Regular, Warning24Filled,
  WifiOff24Regular,
} from '@fluentui/react-icons'
import type { IScannerControls } from '@zxing/browser'
import type { CurrentUser } from '../components/AppHeader'
import type { Contacts } from '../generated/models/ContactsModel'
import type { Msftmfm_assets } from '../generated/models/Msftmfm_assetsModel'
import { Msftmfm_conditionphotosmsftmfm_angletype as conditionPhotoAngleTypeLabels } from '../generated/models/Msftmfm_conditionphotosModel'
import type { Msftmfm_conditionphotosmsftmfm_angletype as ConditionPhotoAngleType } from '../generated/models/Msftmfm_conditionphotosModel'
import type { Msftmfm_conditionphotosmsftmfm_photostatus as ConditionPhotoStatus } from '../generated/models/Msftmfm_conditionphotosModel'
import type { Msftmfm_rentalagreements } from '../generated/models/Msftmfm_rentalagreementsModel'
import type { Msftmfm_returnbookings } from '../generated/models/Msftmfm_returnbookingsModel'

type Step = 'scan' | 'capture' | 'review' | 'success'
type CaptureType = 'asset' | 'meter' | 'receipt'
type AssetValidationStatus = 'idle' | 'validating' | 'matched' | 'mismatched' | 'not-found' | 'error'
type AssetAnalysisStatus = 'processing' | 'captured' | 'analyzed' | 'error'
type ConfirmationDeliveryMethod = 'text' | 'email'
type Capture = { id: string; type: CaptureType; mediaType: 'image' | 'video'; mediaUrl: string; title: string; result: string; capturedAt: string; conditionPhotoId?: string; photoId?: string; angleType?: ConditionPhotoAngleType; analysisSummary?: string; assetAnalysisStatus?: AssetAnalysisStatus; analysisError?: string; file?: File }
const conditionPhotoStatusCaptured: ConditionPhotoStatus = 413920000
const conditionPhotoStatusAnalyzed: ConditionPhotoStatus = 413920001
const conditionPhotoStatusSubmitted: ConditionPhotoStatus = 413920002
const returnBookingStatusArrived = 100000002 as const
const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))
type SpeechRecognitionInstance = {
  continuous: boolean; interimResults: boolean; lang: string; start: () => void; stop: () => void
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

const stepOrder: Step[] = ['scan', 'capture', 'review', 'success']
const spokenDigits: Record<string, string> = {
  zero: '0', oh: '0', one: '1', two: '2', three: '3', four: '4',
  five: '5', six: '6', seven: '7', eight: '8', nine: '9',
}

const normalizeAngleDescription = (value: string) => value
  .toLocaleLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

const assetAngleTypeOptions: Array<{ label: string; value: ConditionPhotoAngleType }> = [
  { label: conditionPhotoAngleTypeLabels[100000007], value: 100000007 as const },
  { label: conditionPhotoAngleTypeLabels[100000008], value: 100000008 as const },
  { label: conditionPhotoAngleTypeLabels[100000009], value: 100000009 as const },
  { label: conditionPhotoAngleTypeLabels[100000005], value: 100000005 as const },
  { label: conditionPhotoAngleTypeLabels[100000001], value: 100000001 as const },
  { label: conditionPhotoAngleTypeLabels[100000002], value: 100000002 as const },
  { label: conditionPhotoAngleTypeLabels[100000003], value: 100000003 as const },
  { label: conditionPhotoAngleTypeLabels[100000004], value: 100000004 as const },
].sort((left, right) => right.label.length - left.label.length)

const getAssetAngleType = (description: string) => {
  const normalizedDescription = normalizeAngleDescription(description)
  const exactMatch = assetAngleTypeOptions.find(
    (option) => normalizeAngleDescription(option.label) === normalizedDescription,
  )
  if (exactMatch) return exactMatch.value

  const paddedDescription = ` ${normalizedDescription} `
  const containedMatch = assetAngleTypeOptions.find(
    (option) => paddedDescription.includes(` ${normalizeAngleDescription(option.label)} `),
  )
  if (!containedMatch) {
    throw new Error(`The image workflow returned an unsupported angle description: "${description}".`)
  }
  return containedMatch.value
}

const parseAssetDescription = (description: string) => {
  const delimiterIndex = description.indexOf(';')
  if (delimiterIndex < 1) {
    throw new Error(`The image workflow returned an invalid angle and summary value: "${description}".`)
  }

  const angle = description.slice(0, delimiterIndex).trim()
  const summary = description.slice(delimiterIndex + 1).trim()
  if (!angle || !summary) {
    throw new Error(`The image workflow returned an incomplete angle and summary value: "${description}".`)
  }
  return { angle, summary }
}

const normalizeAgreementNumber = (transcript: string) => {
  const normalized = transcript
    .toLocaleLowerCase()
    .replace(/\b(?:rental\s+)?agreement(?:\s+number)?\b/g, ' ')
    .replace(/\b(?:dash|hyphen)\b/g, '-')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => spokenDigits[part] || part)
    .join('')
    .replace(/[^a-z0-9-]/g, '')
    .toUpperCase()
  return normalized.replace(/^RA-?(\d+)$/, 'RA-$1')
}

const formatUsdCurrency = (value: string) => {
  const numericValue = value.replace(/\bUSD\b/gi, '').replace(/[$,\s]/g, '')
  if (!/^-?\d+(?:\.\d+)?$/.test(numericValue)) {
    throw new Error('The workflow returned a fuel amount that could not be formatted as US currency.')
  }

  const amount = Number(numericValue)
  if (!Number.isFinite(amount)) {
    throw new Error('The workflow returned an invalid fuel amount.')
  }

  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const parseDecimal = (value: string) => {
  const normalizedValue = value.replace(/,/g, '').trim()
  if (!normalizedValue) return null

  const decimalValue = Number(normalizedValue)
  return Number.isFinite(decimalValue) ? decimalValue : null
}

const formatCurrency = (value: number) => new Intl.NumberFormat(
  'en-US',
  { style: 'currency', currency: 'USD' },
).format(value)

const formatHours = (value: number) => new Intl.NumberFormat(
  'en-US',
  { maximumFractionDigits: 2 },
).format(value)

const getContactFullName = (contact: Contacts) => contact.fullname?.trim()
  || [contact.firstname, contact.lastname].filter(Boolean).join(' ').trim()
  || 'Unnamed contact'

type CheckInPageProps = {
  booking: Msftmfm_returnbookings | null
  currentUser: CurrentUser
  isOnline: boolean
  onCancel: () => void
  onComplete: (bookingId?: string) => void
}

function CheckInPage({ booking: selectedBooking, currentUser, isOnline, onCancel, onComplete }: CheckInPageProps) {
  const bookingRentalAgreementId = selectedBooking?._msftmfm_rentalagreementid_value || ''
  const [step, setStep] = useState<Step>('scan')
  const [assetId, setAssetId] = useState('')
  const [rentalAgreementNumber, setRentalAgreementNumber] = useState('')
  const [agreementNumberLoading, setAgreementNumberLoading] = useState(Boolean(selectedBooking && bookingRentalAgreementId))
  const [agreementNumberError, setAgreementNumberError] = useState(
    selectedBooking && !bookingRentalAgreementId ? 'This return booking is not linked to a rental agreement.' : '',
  )
  const [agreementNumberListening, setAgreementNumberListening] = useState(false)
  const [agreementNumberVoiceError, setAgreementNumberVoiceError] = useState('')
  const [rentalAgreement, setRentalAgreement] = useState<Msftmfm_rentalagreements | null>(null)
  const [contacts, setContacts] = useState<Contacts[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsError, setContactsError] = useState('')
  const [customerAccountName, setCustomerAccountName] = useState('')
  const [selectedContactId, setSelectedContactId] = useState('')
  const [confirmationDeliveryMethod, setConfirmationDeliveryMethod] = useState<ConfirmationDeliveryMethod | ''>('')
  const [confirmationSentTo, setConfirmationSentTo] = useState('')
  const [identifiedAsset, setIdentifiedAsset] = useState<Msftmfm_assets | null>(null)
  const [assetValidationStatus, setAssetValidationStatus] = useState<AssetValidationStatus>('idle')
  const [assetValidationError, setAssetValidationError] = useState('')
  const [captures, setCaptures] = useState<Capture[]>([])
  const [activeCapture, setActiveCapture] = useState<CaptureType>('asset')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo')
  const [isRecordingVideo, setIsRecordingVideo] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const [audioNote, setAudioNote] = useState<File | null>(null)
  const [meterReading, setMeterReading] = useState('')
  const [meterAnalysisStatus, setMeterAnalysisStatus] = useState<'idle' | 'analyzing' | 'saving' | 'error'>('idle')
  const [fuelAmount, setFuelAmount] = useState('')
  const [receiptAnalysisStatus, setReceiptAnalysisStatus] = useState<'idle' | 'analyzing' | 'saving' | 'error'>('idle')
  const [returnId, setReturnId] = useState('')
  const [selectedAssetMediaId, setSelectedAssetMediaId] = useState('')
  const [photoAnalysisStatus, setPhotoAnalysisStatus] = useState<'idle' | 'analyzing' | 'consolidating' | 'complete' | 'error'>('idle')
  const [photoAnalysisProgress, setPhotoAnalysisProgress] = useState('')
  const [photoAnalysisError, setPhotoAnalysisError] = useState('')
  const [consolidatedPhotoAnalysisSummary, setConsolidatedPhotoAnalysisSummary] = useState('')
  const [hasSignature, setHasSignature] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmationError, setConfirmationError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const signatureDrawingRef = useRef(false)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerControlsRef = useRef<IScannerControls | null>(null)
  const scanTimeoutRef = useRef<number | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedVideoChunksRef = useRef<Blob[]>([])
  const assetMediaUrlsRef = useRef<string[]>([])
  const meterAnalysisRequestRef = useRef('')
  const receiptAnalysisRequestRef = useRef('')
  const finalSpeechSegmentsRef = useRef<string[]>([])
  const currentIndex = stepOrder.indexOf(step)
  const selectedContact = contacts.find((contact) => contact.contactid === selectedContactId)
  const confirmationDeliveryValue = confirmationDeliveryMethod === 'text'
    ? selectedContact?.mobilephone || selectedContact?.telephone1 || ''
    : confirmationDeliveryMethod === 'email' ? selectedContact?.emailaddress1 || '' : ''
  const assetCaptures = captures.filter((capture) => capture.type === 'asset')
  const assetImageCaptures = assetCaptures.filter((capture) => capture.mediaType === 'image')
  const assetPhotosProcessing = assetImageCaptures.some((capture) => capture.assetAnalysisStatus === 'processing')
  const assetPhotosReady = assetImageCaptures.length > 0 && assetImageCaptures.every(
    (capture) => (capture.assetAnalysisStatus === 'captured' || capture.assetAnalysisStatus === 'analyzed')
      && Boolean(capture.conditionPhotoId && capture.result),
  )
  const failedAssetCapture = assetImageCaptures.find((capture) => capture.assetAnalysisStatus === 'error')
  const selectedAssetMedia = assetCaptures.find((capture) => capture.id === selectedAssetMediaId) || assetCaptures[0]
  const numericMeterReading = parseDecimal(meterReading)
  const contractedHours = rentalAgreement?.msftmfm_contractedhours
  const overageRatePerHour = rentalAgreement?.msftmfm_overagerateperhour
  const overageHours = numericMeterReading !== null
    && typeof contractedHours === 'number'
    && numericMeterReading > contractedHours
    ? numericMeterReading - contractedHours
    : 0
  const overageCost = overageHours > 0 && typeof overageRatePerHour === 'number'
    ? Math.round((overageHours * overageRatePerHour + Number.EPSILON) * 100) / 100
    : null
  const meterDescription = meterAnalysisStatus === 'analyzing'
    ? 'Validating meter reading…'
    : meterAnalysisStatus === 'saving'
      ? 'Saving meter photo…'
      : overageCost !== null
        ? `${formatHours(overageHours)} hours over · ${formatCurrency(overageCost)} overage`
        : meterReading || (meterAnalysisStatus === 'error' ? cameraError || 'The meter reading could not be processed' : 'Photograph the full display')

  useEffect(() => {
    if (step !== 'review') return

    const frame = window.requestAnimationFrame(() => {
      const canvas = signatureCanvasRef.current
      if (!canvas || canvas.width) return
      const bounds = canvas.getBoundingClientRect()
      const scale = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(bounds.width * scale))
      canvas.height = Math.max(1, Math.round(bounds.height * scale))
      const context = canvas.getContext('2d')
      if (!context) return
      context.scale(scale, scale)
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, bounds.width, bounds.height)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.lineWidth = 2.5
      context.strokeStyle = '#171717'
    })

    return () => window.cancelAnimationFrame(frame)
  }, [step])

  useEffect(() => {
    if (!selectedBooking || !bookingRentalAgreementId) return

    let cancelled = false
    const loadAgreementNumber = async () => {
      try {
        const { Msftmfm_rentalagreementsService } = await import('../generated/services/Msftmfm_rentalagreementsService')
        const result = await Msftmfm_rentalagreementsService.get(bookingRentalAgreementId)
        if (cancelled) return
        const agreementNumber = result.success ? result.data?.msftmfm_agreementnumber : ''
        if (!agreementNumber || !result.data) {
          setAgreementNumberError('The agreement number could not be loaded for this return booking.')
          return
        }
        setRentalAgreementNumber(agreementNumber)
        setRentalAgreement(result.data)
      } catch {
        if (!cancelled) setAgreementNumberError('The agreement number could not be loaded. Check the connection and try again.')
      } finally {
        if (!cancelled) setAgreementNumberLoading(false)
      }
    }

    void loadAgreementNumber()
    return () => { cancelled = true }
  }, [bookingRentalAgreementId, selectedBooking])

  useEffect(() => {
    if (selectedBooking || !rentalAgreementNumber.trim()) return

    let cancelled = false
    const timeout = window.setTimeout(async () => {
      setAgreementNumberLoading(true)
      setAgreementNumberError('')
      setRentalAgreement(null)
      const escapedAgreementNumber = rentalAgreementNumber.trim().replace(/'/g, "''")
      try {
        const { Msftmfm_rentalagreementsService } = await import('../generated/services/Msftmfm_rentalagreementsService')
        const result = await Msftmfm_rentalagreementsService.getAll({
          filter: `statecode eq 0 and msftmfm_agreementnumber eq '${escapedAgreementNumber}'`,
          top: 2,
        })
        if (cancelled) return
        if (!result.success || !result.data) {
          setAgreementNumberError('The rental agreement could not be validated.')
          return
        }
        if (result.data.length === 0) {
          setAgreementNumberError('No active rental agreement matches this agreement number.')
          return
        }
        if (result.data.length > 1) {
          setAgreementNumberError('More than one active rental agreement has this number. Contact a supervisor.')
          return
        }
        setRentalAgreement(result.data[0])
      } catch {
        if (!cancelled) setAgreementNumberError('The rental agreement could not be validated. Check the connection and try again.')
      } finally {
        if (!cancelled) setAgreementNumberLoading(false)
      }
    }, 500)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [rentalAgreementNumber, selectedBooking])

  useEffect(() => {
    let cancelled = false
    const loadContacts = async () => {
      const accountId = rentalAgreement?._msftmfm_customeraccountid_value
      setContacts([])
      setSelectedContactId('')
      setConfirmationDeliveryMethod('')
      setConfirmationSentTo('')
      setContactsError('')
      setCustomerAccountName('')
      setContactsLoading(Boolean(rentalAgreement))
      if (!rentalAgreement) return
      if (!accountId) {
        setContactsError('The rental agreement is not linked to a customer account.')
        setContactsLoading(false)
        return
      }

      setContactsLoading(true)
      try {
        const [{ ContactsService }, { AccountsService }] = await Promise.all([
          import('../generated/services/ContactsService'),
          import('../generated/services/AccountsService'),
        ])
        const [result, accountResult] = await Promise.all([
          ContactsService.getAll({
            filter: `statecode eq 0 and _accountid_value eq '${accountId}'`,
            select: ['contactid', 'fullname', 'firstname', 'lastname', 'emailaddress1', 'mobilephone', 'telephone1'],
            orderBy: ['fullname asc'],
          }),
          AccountsService.get(accountId, { select: ['name'] }),
        ])
        if (cancelled) return
        if (accountResult.success && accountResult.data?.name) {
          setCustomerAccountName(accountResult.data.name)
        } else {
          console.error('The customer account name could not be loaded.', accountResult.error)
          setCustomerAccountName(rentalAgreement.msftmfm_customeraccountidname || 'the customer account')
        }
        if (!result.success || !result.data) {
          setContactsError('Contacts for the customer account could not be loaded.')
          return
        }
        setContacts(result.data)
        if (result.data.length === 0) {
          setContactsError('No active contacts are linked to the customer account on this rental agreement.')
          return
        }
        const agreementContactId = rentalAgreement._msftmfm_customercontactid_value?.toLocaleLowerCase()
        const agreementContact = result.data.find(
          (contact) => contact.contactid.toLocaleLowerCase() === agreementContactId,
        )
        if (agreementContact) setSelectedContactId(agreementContact.contactid)
      } catch (error) {
        console.error('Contacts for the rental agreement account could not be loaded.', error)
        if (!cancelled) setContactsError('Contacts for the customer account could not be loaded. Check the connection and try again.')
      } finally {
        if (!cancelled) setContactsLoading(false)
      }
    }

    void loadContacts()
    return () => { cancelled = true }
  }, [rentalAgreement])

  useEffect(() => {
    if (!assetId.trim() || !rentalAgreement) return

    let cancelled = false
    const timeout = window.setTimeout(async () => {
      setAssetValidationStatus('validating')
      setAssetValidationError('')
      setIdentifiedAsset(null)
      const escapedSerialNumber = assetId.trim().replace(/'/g, "''")
      try {
        const { Msftmfm_assetsService } = await import('../generated/services/Msftmfm_assetsService')
        const result = await Msftmfm_assetsService.getAll({
          filter: `statecode eq 0 and msftmfm_manufacturerserialnumber eq '${escapedSerialNumber}'`,
          select: ['msftmfm_assetid', 'msftmfm_assetnumber', 'msftmfm_manufacturerserialnumber', 'msftmfm_manufacturerproductnumber'],
          top: 2,
        })
        if (cancelled) return
        if (!result.success || !result.data) {
          setAssetValidationStatus('error')
          setAssetValidationError('The asset could not be validated.')
          return
        }
        if (result.data.length === 0) {
          setAssetValidationStatus('not-found')
          setAssetValidationError('No active asset matches this manufacturer serial number.')
          return
        }
        if (result.data.length > 1) {
          setAssetValidationStatus('error')
          setAssetValidationError('More than one active asset has this serial number. Contact a supervisor.')
          return
        }
        const asset = result.data[0]
        setIdentifiedAsset(asset)
        const expectedAssetId = rentalAgreement._msftmfm_assetid_value?.toLocaleLowerCase()
        if (!expectedAssetId) {
          setAssetValidationStatus('error')
          setAssetValidationError('The rental agreement does not have an asset assigned.')
          return
        }
        if (asset.msftmfm_assetid.toLocaleLowerCase() !== expectedAssetId) {
          setAssetValidationStatus('mismatched')
          setAssetValidationError('This serial number belongs to a different asset than the one on the rental agreement.')
          return
        }
        setAssetValidationStatus('matched')
      } catch {
        if (!cancelled) {
          setAssetValidationStatus('error')
          setAssetValidationError('The asset could not be validated. Check the connection and try again.')
        }
      }
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [assetId, rentalAgreement])

  useEffect(() => {
    return () => {
      scannerControlsRef.current?.stop()
      recognitionRef.current?.stop()
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.ondataavailable = null
        mediaRecorderRef.current.onstop = null
        mediaRecorderRef.current.stop()
      }
      if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      assetMediaUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const stopCamera = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      return
    }
    scannerControlsRef.current?.stop()
    scannerControlsRef.current = null
    if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current)
    scanTimeoutRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
    setIsRecordingVideo(false)
  }

  const updateSerialNumber = (value: string) => {
    setAssetId(value.trimStart().toUpperCase())
    setIdentifiedAsset(null)
    setAssetValidationStatus('idle')
    setAssetValidationError('')
  }

  const updateAgreementNumber = (value: string) => {
    setRentalAgreementNumber(value.trimStart().toUpperCase())
    setRentalAgreement(null)
    setContacts([])
    setSelectedContactId('')
    setConfirmationDeliveryMethod('')
    setConfirmationSentTo('')
    setContactsError('')
    setCustomerAccountName('')
    setIdentifiedAsset(null)
    setAssetValidationStatus('idle')
    setAssetValidationError('')
  }

  const startCamera = async (forBarcode = false, includeAudio = false) => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: forBarcode ? 1280 : 1920 },
          height: { ideal: forBarcode ? 720 : 1080 },
        },
        audio: includeAudio,
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
    const [{ BrowserMultiFormatReader }, {
      BarcodeFormat, ChecksumException, DecodeHintType, FormatException, NotFoundException,
    }] = await Promise.all([
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
      const controls = await reader.decodeFromStream(stream, video, (result, error, activeControls) => {
        if (!result) {
          const isExpectedScanMiss = error instanceof ChecksumException
            || error instanceof FormatException
            || error instanceof NotFoundException
          if (error && !isExpectedScanMiss) {
            activeControls.stop()
            scannerControlsRef.current = null
            streamRef.current = null
            setCameraOpen(false)
            setCameraError('The scanner stopped unexpectedly. Open it and try again, or enter the serial number manually.')
          }
          return
        }
        const value = result.getText().trim()
        if (!value) return
        activeControls.stop()
        scannerControlsRef.current = null
        if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current)
        scanTimeoutRef.current = null
        streamRef.current = null
        updateSerialNumber(value)
        setCameraError('')
        setCameraOpen(false)
      })
      if (stream.active) {
        scannerControlsRef.current = controls
        scanTimeoutRef.current = window.setTimeout(() => {
          setCameraError('Still scanning. Fill the tag inside the frame, hold steady, and avoid glare—or enter the asset ID manually.')
        }, 12000)
      }
    } catch {
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setCameraOpen(false)
      setCameraError('The scanner could not start in Power Apps. Check camera permissions or enter the asset ID manually.')
    }
  }

  const takePhoto = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageUrl = canvas.toDataURL('image/jpeg', 0.82)
    const assetCount = captures.filter((item) => item.type === 'asset').length
    const sample = activeCapture === 'asset'
      ? { title: `Asset photo ${assetCount + 1}`, result: '' }
      : activeCapture === 'meter'
        ? { title: 'Hour meter', result: '' }
        : { title: 'Fuel receipt', result: '' }
    const captureId = crypto.randomUUID()
    const capturedAt = new Date()
    const capturedPhoto: Capture = {
      id: captureId,
      type: activeCapture,
      mediaType: 'image',
      mediaUrl: imageUrl,
      capturedAt: capturedAt.toISOString(),
      assetAnalysisStatus: activeCapture === 'asset' ? 'processing' : undefined,
      ...sample,
    }
    setCaptures((items) => activeCapture === 'asset'
      ? [...items, capturedPhoto]
      : [...items.filter((item) => item.type !== activeCapture), capturedPhoto])
    if (activeCapture === 'asset') {
      setSelectedAssetMediaId(captureId)
      setPhotoAnalysisStatus('idle')
      setPhotoAnalysisProgress('Analyzing captured photo…')
      setPhotoAnalysisError('')
      setConsolidatedPhotoAnalysisSummary('')
      void processAssetCapture(capturedPhoto)
    }
    if (activeCapture === 'meter') {
      const contentBytes = imageUrl.split(',', 2)[1]
      meterAnalysisRequestRef.current = captureId
      setMeterReading('')
      setMeterAnalysisStatus('analyzing')
      stopCamera()

      try {
        if (!contentBytes) throw new Error('The captured meter image could not be encoded.')
        const { EquipmentReimagined_AnalyzeImageService } = await import('../generated/services/EquipmentReimagined_AnalyzeImageService')
        const response = await EquipmentReimagined_AnalyzeImageService.Run({
          file: { name: `hour-meter-${capturedAt.getTime()}.jpg`, contentBytes },
          text: 'Meter',
        })
        if (meterAnalysisRequestRef.current !== captureId) return
        const result = response.success ? response.data?.result?.trim() : ''
        if (!result) throw new Error('The workflow did not return a meter reading.')

        setMeterAnalysisStatus('saving')
        await saveConditionPhoto({
          analysisResult: result,
          angleType: 100000000,
          capturedAt,
          contentBytes,
          description: 'meter reading',
          photoStatus: conditionPhotoStatusAnalyzed,
        })

        setMeterReading(result)
        setCaptures((items) => items.map((capture) => capture.id === captureId ? { ...capture, result } : capture))
        setMeterAnalysisStatus('idle')
      } catch (error) {
        if (meterAnalysisRequestRef.current !== captureId) return
        console.error('The hour meter image could not be analyzed.', error)
        setMeterAnalysisStatus('error')
        setCameraError(error instanceof Error ? error.message : 'The hour meter image could not be analyzed. Retake the photo and try again.')
      }
    }
    if (activeCapture === 'receipt') {
      const contentBytes = imageUrl.split(',', 2)[1]
      receiptAnalysisRequestRef.current = captureId
      setFuelAmount('')
      setReceiptAnalysisStatus('analyzing')
      stopCamera()

      try {
        if (!contentBytes) throw new Error('The captured fuel receipt image could not be encoded.')
        const { EquipmentReimagined_AnalyzeImageService } = await import('../generated/services/EquipmentReimagined_AnalyzeImageService')
        const response = await EquipmentReimagined_AnalyzeImageService.Run({
          file: { name: `fuel-receipt-${capturedAt.getTime()}.jpg`, contentBytes },
          text: 'Receipt',
        })
        if (receiptAnalysisRequestRef.current !== captureId) return
        const result = response.success ? response.data?.result?.trim() : ''
        if (!result) throw new Error('The workflow did not return a fuel receipt amount.')

        const formattedResult = formatUsdCurrency(result)
        setReceiptAnalysisStatus('saving')
        await saveConditionPhoto({
          analysisResult: formattedResult,
          angleType: 100000006,
          capturedAt,
          contentBytes,
          description: 'fuel receipt',
          photoStatus: conditionPhotoStatusAnalyzed,
        })

        setFuelAmount(formattedResult)
        setCaptures((items) => items.map((capture) => capture.id === captureId ? { ...capture, result: formattedResult } : capture))
        setReceiptAnalysisStatus('idle')
      } catch (error) {
        if (receiptAnalysisRequestRef.current !== captureId) return
        console.error('The fuel receipt image could not be analyzed.', error)
        setReceiptAnalysisStatus('error')
        setCameraError(error instanceof Error ? error.message : 'The fuel receipt image could not be analyzed. Retake the photo and try again.')
      }
    }
    if (activeCapture !== 'asset') stopCamera()
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
        const nextTranscript = [finalText, interimAlreadyFinal ? '' : interim].filter(Boolean).join(' ')
        setTranscript(nextTranscript)
      }
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
    } catch {
      setVoiceError('Microphone access was denied. Enable Microphone for Microsoft Power Apps in the phone settings, or use “Record with phone”.')
    }
  }

  const toggleAgreementNumberListening = async () => {
    if (agreementNumberListening) {
      recognitionRef.current?.stop()
      setAgreementNumberListening(false)
      return
    }
    setAgreementNumberVoiceError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      const speechWindow = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
      const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setAgreementNumberVoiceError('Voice entry is not available in this Power Apps mobile view. Type the agreement number instead.')
        return
      }
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.onresult = (event) => {
        const spokenValue = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(' ')
        const agreementNumber = normalizeAgreementNumber(spokenValue)
        if (!agreementNumber) {
          setAgreementNumberVoiceError('No agreement number was recognized. Try again or type the number.')
          return
        }
        updateAgreementNumber(agreementNumber)
      }
      recognition.onend = () => setAgreementNumberListening(false)
      recognitionRef.current = recognition
      recognition.start()
      setAgreementNumberListening(true)
    } catch {
      setAgreementNumberVoiceError('Microphone access was denied. Enable Microphone for Microsoft Power Apps, or type the agreement number.')
    }
  }

  const captureAudioNote = (file: File | undefined) => {
    if (!file) return
    setAudioNote(file)
    setVoiceError('')
  }

  const openVideoRecorder = () => {
    if (typeof MediaRecorder === 'undefined') {
      setCameraError('Video recording is not supported in this mobile browser or Power Apps view.')
      return
    }
    setActiveCapture('asset')
    setCameraMode('video')
    void startCamera(false, true)
  }

  const startVideoRecording = () => {
    const stream = streamRef.current
    if (!stream) return
    setCameraError('')
    const supportedType = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find((type) => MediaRecorder.isTypeSupported(type))
    try {
      const recorder = supportedType ? new MediaRecorder(stream, { mimeType: supportedType }) : new MediaRecorder(stream)
      recordedVideoChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size) recordedVideoChunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || supportedType || 'video/webm'
        const videoBlob = new Blob(recordedVideoChunksRef.current, { type: mimeType })
        if (videoBlob.size) {
          const extension = mimeType.includes('mp4') ? 'mp4' : 'webm'
          const file = new File([videoBlob], `asset-walk-around-${Date.now()}.${extension}`, { type: mimeType })
          const mediaUrl = URL.createObjectURL(file)
          const captureId = crypto.randomUUID()
          assetMediaUrlsRef.current.push(mediaUrl)
          setCaptures((items) => [...items, { id: captureId, type: 'asset', mediaType: 'video', mediaUrl, title: 'Asset walk-around video', result: 'Asset walk-around', capturedAt: new Date().toISOString(), file }])
          setSelectedAssetMediaId(captureId)
        }
        recordedVideoChunksRef.current = []
        mediaRecorderRef.current = null
        setIsRecordingVideo(false)
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setCameraOpen(false)
        setCameraMode('photo')
      }
      mediaRecorderRef.current = recorder
      recorder.start(250)
      setIsRecordingVideo(true)
    } catch {
      setCameraError('The video recorder could not start. Check camera and microphone permissions.')
    }
  }

  async function processAssetCapture(capture: Capture) {
    if (capture.conditionPhotoId) return
    setCaptures((items) => items.map((item) => item.id === capture.id
      ? { ...item, assetAnalysisStatus: 'processing', analysisError: undefined }
      : item))
    setPhotoAnalysisError('')
    setPhotoAnalysisProgress(`Analyzing ${capture.title}…`)
    setCameraError('')

    try {
      const contentBytes = capture.mediaUrl.split(',', 2)[1]
      if (!contentBytes) throw new Error(`${capture.title} could not be encoded for analysis.`)

      const { EquipmentReimagined_AnalyzeImageService } = await import('../generated/services/EquipmentReimagined_AnalyzeImageService')
      let result = ''
      let description = ''
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const response = await EquipmentReimagined_AnalyzeImageService.Run({
            file: { name: `asset-photo-${capture.id}-${new Date(capture.capturedAt).getTime()}.jpg`, contentBytes },
            text: 'Asset',
          })
          result = response.success ? response.data?.result?.trim() || '' : ''
          description = response.success ? response.data?.description?.trim() || '' : ''
          if (result && description) break
        } catch (error) {
          if (attempt === 1) throw error
        }
        await wait(1000)
      }
      if (!result) throw new Error(`The workflow did not return a result for ${capture.title}.`)
      if (!description) throw new Error(`The workflow did not return an angle and summary for ${capture.title}.`)
      const { angle, summary } = parseAssetDescription(description)
      const savedConditionPhoto = await saveConditionPhoto({
        analysisResult: result,
        analysisSummary: summary,
        angleType: getAssetAngleType(angle),
        capturedAt: new Date(capture.capturedAt),
        contentBytes,
        description: capture.title.toLocaleLowerCase(),
        photoStatus: conditionPhotoStatusCaptured,
      })

      setCaptures((items) => items.map((item) => item.id === capture.id
        ? {
            ...item,
            result,
            conditionPhotoId: savedConditionPhoto.conditionPhotoId,
            photoId: savedConditionPhoto.photoId,
            angleType: savedConditionPhoto.angleType,
            analysisSummary: savedConditionPhoto.analysisSummary,
            assetAnalysisStatus: 'captured',
            analysisError: undefined,
          }
        : item))
      setPhotoAnalysisProgress('Captured photo analysis saved')
    } catch (error) {
      const message = error instanceof Error ? error.message : `${capture.title} could not be analyzed.`
      console.error('The captured asset photo could not be analyzed.', error)
      setCaptures((items) => items.map((item) => item.id === capture.id
        ? { ...item, assetAnalysisStatus: 'error', analysisError: message }
        : item))
      setPhotoAnalysisProgress('')
      setPhotoAnalysisError(message)
      setCameraError(message)
    }
  }

  const analyzePhotos = async () => {
    const imageCaptures = assetCaptures.filter((capture) => capture.mediaType === 'image')
    if (!imageCaptures.length) return
    const unavailableCapture = imageCaptures.find(
      (capture) => (capture.assetAnalysisStatus !== 'captured' && capture.assetAnalysisStatus !== 'analyzed')
        || !capture.conditionPhotoId
        || !capture.result,
    )
    if (unavailableCapture) {
      setPhotoAnalysisStatus('error')
      setPhotoAnalysisError(unavailableCapture.analysisError || `${unavailableCapture.title} is still being analyzed.`)
      return
    }

    setPhotoAnalysisStatus('consolidating')
    setPhotoAnalysisProgress('Consolidating photo results')
    setPhotoAnalysisError('')
    setConsolidatedPhotoAnalysisSummary('')
    setCameraError('')

    try {
      const { Msftmfm_conditionphotosService } = await import('../generated/services/Msftmfm_conditionphotosService')
      const analysisResults = await Promise.all(imageCaptures.map(async (capture) => {
        const persistedPhotoResponse = await Msftmfm_conditionphotosService.get(capture.conditionPhotoId!, {
          select: ['msftmfm_conditionphotoid', 'msftmfm_photoid', 'msftmfm_analysisresult', 'msftmfm_photostatus'],
        })
        const persistedResult = persistedPhotoResponse.success
          ? persistedPhotoResponse.data?.msftmfm_analysisresult?.trim() || ''
          : ''
        if (!persistedResult) {
          throw new Error(`${capture.title} does not have a persisted Analysis Result for consolidation.`)
        }
        return persistedResult
      }))
      setPhotoAnalysisStatus('consolidating')
      const { EquipmentReimagined_AnalyzeConsolidatedImageResultsService } = await import('../generated/services/EquipmentReimagined_AnalyzeConsolidatedImageResultsService')
      const consolidationResponse = await EquipmentReimagined_AnalyzeConsolidatedImageResultsService.Run({
        text: analysisResults.join('\n\n'),
      })
      const consolidatedResult = consolidationResponse.success
        ? consolidationResponse.data?.consolidatedresult?.trim() || ''
        : ''
      const consolidatedSummary = consolidationResponse.success
        ? consolidationResponse.data?.consolidatedsummary?.trim() || ''
        : ''
      if (!consolidatedResult) throw new Error('The consolidation workflow did not return an asset photo result.')
      if (!consolidatedSummary) throw new Error('The consolidation workflow did not return an asset photo summary.')

      const returnBookingId = selectedBooking?.msftmfm_returnbookingid
      if (!returnBookingId) throw new Error('The consolidated image analysis could not be saved because no Return Booking is selected.')
      const { Msftmfm_returnbookingsService } = await import('../generated/services/Msftmfm_returnbookingsService')
      const bookingUpdateResponse = await Msftmfm_returnbookingsService.update(returnBookingId, {
        msftmfm_imageanalysis: consolidatedResult,
        msftmfm_imageanalysissummary: consolidatedSummary,
      })
      if (!bookingUpdateResponse.success) {
        throw new Error(bookingUpdateResponse.error?.message || 'The consolidated image analysis could not be saved to the Return Booking.')
      }
      const bookingVerificationResponse = await Msftmfm_returnbookingsService.get(returnBookingId, {
        select: ['msftmfm_returnbookingid', 'msftmfm_imageanalysis', 'msftmfm_imageanalysissummary'],
      })
      if (!bookingVerificationResponse.success
        || bookingVerificationResponse.data?.msftmfm_imageanalysis !== consolidatedResult
        || bookingVerificationResponse.data?.msftmfm_imageanalysissummary !== consolidatedSummary) {
        throw new Error('The consolidated image analysis could not be verified on the Return Booking.')
      }

      for (const capture of imageCaptures) {
        const photoStatusResponse = await Msftmfm_conditionphotosService.update(
          capture.conditionPhotoId!,
          { msftmfm_photostatus: conditionPhotoStatusAnalyzed },
        )
        if (!photoStatusResponse.success) {
          throw new Error(photoStatusResponse.error?.message || `${capture.title} could not be marked as Analyzed.`)
        }
        const photoVerificationResponse = await Msftmfm_conditionphotosService.get(capture.conditionPhotoId!, {
          select: ['msftmfm_conditionphotoid', 'msftmfm_photostatus'],
        })
        if (!photoVerificationResponse.success || photoVerificationResponse.data?.msftmfm_photostatus !== conditionPhotoStatusAnalyzed) {
          throw new Error(`${capture.title} could not be verified as Analyzed.`)
        }
      }

      setConsolidatedPhotoAnalysisSummary(consolidatedSummary)
      setCaptures((items) => items.map((item) => item.type === 'asset' && item.mediaType === 'image'
        ? { ...item, assetAnalysisStatus: 'analyzed' }
        : item))
      setPhotoAnalysisStatus('complete')
      setPhotoAnalysisProgress(`${imageCaptures.length} photo${imageCaptures.length === 1 ? '' : 's'} analyzed`)
    } catch (error) {
      console.error('The asset photos could not be analyzed.', error)
      setPhotoAnalysisStatus('error')
      setPhotoAnalysisProgress('')
      const message = error instanceof Error ? error.message : 'The asset photos could not be analyzed. Try again.'
      setPhotoAnalysisError(message)
      setCameraError(message)
    }
  }

  const showAdjacentAssetMedia = (direction: -1 | 1) => {
    if (!selectedAssetMedia || assetCaptures.length < 2) return
    const currentMediaIndex = assetCaptures.findIndex((capture) => capture.id === selectedAssetMedia.id)
    const nextMediaIndex = (currentMediaIndex + direction + assetCaptures.length) % assetCaptures.length
    setSelectedAssetMediaId(assetCaptures[nextMediaIndex].id)
  }

  const deleteAssetMedia = async (captureId: string) => {
    const capture = assetCaptures.find((item) => item.id === captureId)
    if (!capture) return
    if (capture.conditionPhotoId) {
      try {
        const { Msftmfm_conditionphotosService } = await import('../generated/services/Msftmfm_conditionphotosService')
        await Msftmfm_conditionphotosService.delete(capture.conditionPhotoId)
      } catch (error) {
        console.error('The asset condition photo could not be deleted.', error)
        setCameraError('The saved asset photo could not be deleted. Try again.')
        return
      }
    }
    if (capture.file) {
      URL.revokeObjectURL(capture.mediaUrl)
      assetMediaUrlsRef.current = assetMediaUrlsRef.current.filter((url) => url !== capture.mediaUrl)
    }
    const currentMediaIndex = assetCaptures.findIndex((item) => item.id === captureId)
    const remainingMedia = assetCaptures.filter((item) => item.id !== captureId)
    setSelectedAssetMediaId(remainingMedia[Math.min(currentMediaIndex, remainingMedia.length - 1)]?.id || '')
    setCaptures((items) => items.filter((item) => item.id !== captureId))
    if (capture.mediaType === 'image') {
      setPhotoAnalysisStatus('idle')
      setPhotoAnalysisProgress('')
      setPhotoAnalysisError('')
      setConsolidatedPhotoAnalysisSummary('')
    }
  }

  const startCapture = (type: CaptureType) => { setActiveCapture(type); setCameraMode('photo'); void startCamera() }

  const saveConditionPhoto = async ({
    analysisResult,
    analysisSummary,
    angleType,
    capturedAt,
    contentBytes,
    description,
    photoStatus,
  }: {
    analysisResult: string
    analysisSummary?: string
    angleType: ConditionPhotoAngleType
    capturedAt: Date
    contentBytes: string
    description: string
    photoStatus?: ConditionPhotoStatus
  }) => {
    const returnBookingId = selectedBooking?.msftmfm_returnbookingid
    if (!returnBookingId) {
      throw new Error(`The ${description} was analyzed, but it could not be saved because no Return Booking is selected.`)
    }

    const { Msftmfm_conditionphotosService } = await import('../generated/services/Msftmfm_conditionphotosService')
    let conditionPhotoId = ''
    try {
      const createResponse = await Msftmfm_conditionphotosService.create({
        msftmfm_analysisresult: analysisResult,
        ...(analysisSummary ? { msftmfm_analysissummary: analysisSummary } : {}),
        msftmfm_angletype: angleType,
        msftmfm_capturetime: capturedAt.toISOString(),
        ...(photoStatus ? { msftmfm_photostatus: photoStatus } : {}),
        'msftmfm_ReturnBooking@odata.bind': `/msftmfm_returnbookings(${returnBookingId})`,
        statecode: 0,
      })
      if (!createResponse.success) {
        throw new Error(createResponse.error?.message || `The ${description} condition photo record could not be created.`)
      }

      conditionPhotoId = createResponse.data?.msftmfm_conditionphotoid || ''
      if (!conditionPhotoId) {
        for (let attempt = 0; attempt < 3 && !conditionPhotoId; attempt += 1) {
          if (attempt) await wait(500 * attempt)
          const createdRecordResponse = await Msftmfm_conditionphotosService.getAll({
            select: ['msftmfm_conditionphotoid'],
            filter: `_msftmfm_returnbooking_value eq ${returnBookingId} and msftmfm_capturetime ge ${new Date(capturedAt.getTime() - 5000).toISOString()} and msftmfm_capturetime le ${new Date(capturedAt.getTime() + 5000).toISOString()}`,
            orderBy: ['createdon desc'],
            top: 1,
          })
          conditionPhotoId = createdRecordResponse.success
            ? createdRecordResponse.data?.[0]?.msftmfm_conditionphotoid || ''
            : ''
        }
      }
      if (!conditionPhotoId) {
        throw new Error(`The ${description} condition photo was created, but its record ID was not returned, so the image could not be saved.`)
      }

      let imageUpdateResponse = await Msftmfm_conditionphotosService.update(
        conditionPhotoId,
        { msftmfm_capturedphoto: contentBytes },
      )
      for (let attempt = 1; attempt < 3 && !imageUpdateResponse.success; attempt += 1) {
        await wait(500 * attempt)
        imageUpdateResponse = await Msftmfm_conditionphotosService.update(
          conditionPhotoId,
          { msftmfm_capturedphoto: contentBytes },
        )
      }
      if (!imageUpdateResponse.success) {
        throw new Error(imageUpdateResponse.error?.message || `The ${description} image could not be added to the Captured Photo field.`)
      }

      const retrieveConditionPhoto = () => Msftmfm_conditionphotosService.get(conditionPhotoId, {
        select: ['msftmfm_conditionphotoid', 'msftmfm_photoid', 'msftmfm_angletype', 'msftmfm_analysisresult', 'msftmfm_analysissummary', 'msftmfm_photostatus', 'msftmfm_capturedphotoid'],
      })
      let verificationResponse = await retrieveConditionPhoto()
      const isVerificationComplete = () => verificationResponse.success
        && Boolean(verificationResponse.data?.msftmfm_conditionphotoid)
        && Boolean(verificationResponse.data?.msftmfm_capturedphotoid)
        && Boolean(verificationResponse.data?.msftmfm_photoid)
        && Boolean(verificationResponse.data?.msftmfm_angletype)
        && (!analysisSummary || verificationResponse.data?.msftmfm_analysissummary === analysisSummary)
        && (!photoStatus || verificationResponse.data?.msftmfm_photostatus === photoStatus)
      for (let attempt = 1; attempt < 4 && !isVerificationComplete(); attempt += 1) {
        await wait(500 * attempt)
        verificationResponse = await retrieveConditionPhoto()
      }
      if (!verificationResponse.success || !verificationResponse.data?.msftmfm_conditionphotoid) {
        throw new Error(`The ${description} condition photo could not be verified after it was saved.`)
      }
      if (!verificationResponse.data.msftmfm_capturedphotoid) {
        throw new Error(`The ${description} record was created, but the Captured Photo image could not be verified.`)
      }
      const photoId = verificationResponse.data.msftmfm_photoid
      const savedAngleType = verificationResponse.data.msftmfm_angletype
      if (!photoId) {
        throw new Error(`The ${description} record was created, but its Photo ID could not be verified.`)
      }
      if (!savedAngleType) {
        throw new Error(`The ${description} record was created, but its angle type could not be verified.`)
      }
      if (analysisSummary && verificationResponse.data.msftmfm_analysissummary !== analysisSummary) {
        throw new Error(`The ${description} record was created, but its Analysis Summary could not be verified.`)
      }
      if (photoStatus && verificationResponse.data.msftmfm_photostatus !== photoStatus) {
        throw new Error(`The ${description} record was created, but its Photo Status could not be verified.`)
      }
      return {
        conditionPhotoId,
        photoId,
        angleType: savedAngleType,
        analysisSummary: verificationResponse.data.msftmfm_analysissummary,
      }
    } catch (error) {
      if (conditionPhotoId) {
        try {
          await Msftmfm_conditionphotosService.delete(conditionPhotoId)
        } catch (cleanupError) {
          console.error(`The incomplete ${description} condition photo record could not be removed.`, cleanupError)
        }
      }
      throw error
    }
  }

  const getSignaturePoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  }

  const startSignature = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (isConfirming) return
    const context = event.currentTarget.getContext('2d')
    if (!context) {
      setConfirmationError('Signature capture is not available on this device.')
      return
    }
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = getSignaturePoint(event)
    context.beginPath()
    context.moveTo(point.x, point.y)
    signatureDrawingRef.current = true
    setConfirmationError('')
  }

  const drawSignature = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!signatureDrawingRef.current) return
    event.preventDefault()
    const context = event.currentTarget.getContext('2d')
    if (!context) return
    const point = getSignaturePoint(event)
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  const finishSignature = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!signatureDrawingRef.current) return
    event.preventDefault()
    signatureDrawingRef.current = false
    event.currentTarget.getContext('2d')?.closePath()
    setHasSignature(true)
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.restore()
    setHasSignature(false)
    setConfirmationError('')
  }

  const returnToCapture = () => {
    setHasSignature(false)
    setConfirmationError('')
    setStep('capture')
  }

  const getSignatureContentBytes = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) throw new Error('The signature could not be read.')
    const contentBytes = canvas.toDataURL('image/png').split(',', 2)[1]
    if (!contentBytes) throw new Error('The signature could not be converted to an image.')
    return contentBytes
  }

  const confirmReturn = async () => {
    if (!isOnline || isConfirming) return
    const returnBookingId = selectedBooking?.msftmfm_returnbookingid
    if (!returnBookingId) {
      setConfirmationError('No Return Booking is selected. Return to the booking list and try again.')
      return
    }
    if (!selectedContact) {
      setConfirmationError('Select a check-in contact before confirming the return.')
      return
    }
    if (numericMeterReading === null) {
      setConfirmationError('Enter a valid hour meter reading before confirming the return.')
      return
    }
    if (overageHours > 0 && overageCost === null) {
      setConfirmationError('The overage charge cannot be saved because the rental agreement does not have an overage rate.')
      return
    }
    if (!hasSignature) {
      setConfirmationError('The customer must provide a signature before confirming the return.')
      return
    }

    setIsConfirming(true)
    setConfirmationError('')
    try {
      const signatureContentBytes = getSignatureContentBytes()
      const [
        { Msftmfm_returnbookingsService },
        { Msftmfm_conditionphotosService },
      ] = await Promise.all([
        import('../generated/services/Msftmfm_returnbookingsService'),
        import('../generated/services/Msftmfm_conditionphotosService'),
      ])

      const bookingUpdateResponse = await Msftmfm_returnbookingsService.update(returnBookingId, {
        msftmfm_returnhours: numericMeterReading,
        ...(overageCost !== null ? { msftmfm_returncharges: overageCost } : {}),
        msftmfm_returnsignature: signatureContentBytes,
        msftmfm_voicenotes: transcript,
        msftmfm_status: returnBookingStatusArrived,
        'msftmfm_ReturnContact@odata.bind': `/contacts(${selectedContact.contactid})`,
      })
      if (!bookingUpdateResponse.success) {
        throw new Error(bookingUpdateResponse.error?.message || 'The return details, voice notes, contact, and customer signature could not be saved.')
      }

      const relatedPhotosResponse = await Msftmfm_conditionphotosService.getAll({
        select: ['msftmfm_conditionphotoid', 'msftmfm_photostatus'],
        filter: `_msftmfm_returnbooking_value eq ${returnBookingId}`,
      })
      if (!relatedPhotosResponse.success) {
        throw new Error(relatedPhotosResponse.error?.message || 'The related Condition Photo records could not be loaded.')
      }

      const relatedPhotos = relatedPhotosResponse.data || []
      for (const photo of relatedPhotos) {
        const photoUpdateResponse = await Msftmfm_conditionphotosService.update(
          photo.msftmfm_conditionphotoid,
          { msftmfm_photostatus: conditionPhotoStatusSubmitted },
        )
        if (!photoUpdateResponse.success) {
          throw new Error(photoUpdateResponse.error?.message || 'A related Condition Photo could not be marked as Submitted.')
        }
      }

      const [bookingVerificationResponse, photoVerificationResponse] = await Promise.all([
        Msftmfm_returnbookingsService.get(returnBookingId, {
          select: [
            'msftmfm_returnbookingid',
            'msftmfm_returnhours',
            'msftmfm_returncharges',
            '_msftmfm_returncontact_value',
            'msftmfm_returnsignatureid',
            'msftmfm_voicenotes',
            'msftmfm_status',
          ],
        }),
        Msftmfm_conditionphotosService.getAll({
          select: ['msftmfm_conditionphotoid', 'msftmfm_photostatus'],
          filter: `_msftmfm_returnbooking_value eq ${returnBookingId}`,
        }),
      ])
      if (!bookingVerificationResponse.success
        || bookingVerificationResponse.data?.msftmfm_returnhours !== numericMeterReading
        || (overageCost !== null && bookingVerificationResponse.data?.msftmfm_returncharges !== overageCost)
        || bookingVerificationResponse.data?._msftmfm_returncontact_value?.toLocaleLowerCase() !== selectedContact.contactid.toLocaleLowerCase()
        || !bookingVerificationResponse.data?.msftmfm_returnsignatureid
        || (bookingVerificationResponse.data?.msftmfm_voicenotes ?? '') !== transcript
        || bookingVerificationResponse.data?.msftmfm_status !== returnBookingStatusArrived) {
        throw new Error('The saved return details, voice notes, contact, signature, and Arrived status could not be verified.')
      }
      if (!photoVerificationResponse.success
        || (photoVerificationResponse.data || []).some(
          (photo) => photo.msftmfm_photostatus !== conditionPhotoStatusSubmitted,
        )) {
        throw new Error('The Submitted status could not be verified on every related Condition Photo.')
      }

      setReturnId(selectedBooking.msftmfm_bookingreference)
      setStep('success')
    } catch (error) {
      console.error('The equipment return could not be confirmed.', error)
      setConfirmationError(error instanceof Error ? error.message : 'The equipment return could not be confirmed. Try again.')
    } finally {
      setIsConfirming(false)
    }
  }

  const returnToBookings = () => {
    stopCamera()
    onComplete(selectedBooking?.msftmfm_returnbookingid)
  }

  const cancelCheckIn = () => {
    stopCamera()
    onCancel()
  }

  return (
    <>
      {step !== 'success' && (
        <nav className="checkin-navigation" aria-label="Check-in navigation">
          <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={cancelCheckIn}>Back to return bookings</Button>
        </nav>
      )}
      <div className="workspace">
          <aside className="sidebar">
            <p className="eyebrow">RETURN CHECK-IN</p>
            <h1>{step === 'success' ? 'Return complete' : assetId || selectedBooking?.msftmfm_bookingreference || 'New return'}</h1>
            <p className="booking-context">Rental agreement: {rentalAgreementNumber || 'Required'}</p>
            <p className="sidebar-copy">One walk-around. Capture everything before the customer leaves.</p>
            <nav className="steps" aria-label="Check-in progress">
              {(['scan', 'capture', 'review'] as Step[]).map((item, index) => (
                <div className={`step-item ${step === item ? 'active' : ''} ${currentIndex > index ? 'done' : ''}`} key={item}>
                  <span>{currentIndex > index ? <Checkmark24Regular /> : index + 1}</span>
                  <div><strong>{item === 'scan' ? 'Identify equipment' : item === 'capture' ? 'Walk-around capture' : 'Review & confirm'}</strong><small>{item === 'scan' ? 'Scan the asset tag' : item === 'capture' ? 'Asset media, meter & voice' : 'You have final say'}</small></div>
                </div>
              ))}
            </nav>
            <div className="safety-note"><Warning24Filled /><span><strong>Stay aware</strong>Keep clear of moving equipment while using the camera.</span></div>
          </aside>

          <main className="main-content">
            {step !== 'success' && <ProgressBar value={(currentIndex + 1) / 3} thickness="large" />}

            {step === 'scan' && (
              <section className="screen scan-screen">
                <div className="screen-heading"><p className="eyebrow">STEP 1 OF 3</p><h2>Identify the equipment</h2><p>Scan the manufacturer serial number and verify it matches the asset on the rental agreement.</p></div>
                <Card className="rental-agreement-card">
                  <div>
                    <span>RENTAL AGREEMENT</span>
                    <h3>{selectedBooking ? 'Linked to this return booking' : 'Enter the agreement number'}</h3>
                    <p>{selectedBooking ? 'Verify this is the correct rental agreement before scanning the equipment.' : 'An agreement number is required before starting the walk-around.'}</p>
                  </div>
                  {selectedBooking ? (
                    <div className="rental-agreement-values">
                      <div>
                        <span>AGREEMENT NUMBER</span>
                        <strong>{agreementNumberLoading ? 'Loading…' : rentalAgreementNumber || 'Not available'}</strong>
                        {agreementNumberError && <small>{agreementNumberError}</small>}
                      </div>
                    </div>
                  ) : (
                    <div className="agreement-number-entry">
                      <div>
                        <Input
                          size="large"
                          value={rentalAgreementNumber}
                          onChange={(_, data) => updateAgreementNumber(data.value)}
                          placeholder="e.g. RA-20981"
                          aria-label="Rental agreement number"
                        />
                        <Button
                          appearance={agreementNumberListening ? 'primary' : 'secondary'}
                          size="large"
                          icon={agreementNumberListening ? <Mic24Filled /> : <Mic24Regular />}
                          onClick={() => void toggleAgreementNumberListening()}
                        >
                          {agreementNumberListening ? 'Listening…' : 'Enter by voice'}
                        </Button>
                      </div>
                      {agreementNumberVoiceError && <p className="agreement-voice-error"><Warning24Filled />{agreementNumberVoiceError}</p>}
                      {agreementNumberLoading && <p className="agreement-validation-note"><Spinner size="tiny" />Validating agreement number…</p>}
                      {agreementNumberError && <p className="agreement-voice-error"><Warning24Filled />{agreementNumberError}</p>}
                    </div>
                  )}
                </Card>
                {rentalAgreement && (
                  <Card className="contact-selection-card">
                    <div>
                      <span>CHECK-IN CONTACT · REQUIRED</span>
                      <h3>Select the customer contact</h3>
                      <p>Contacts are limited to {customerAccountName || 'the customer account'}.</p>
                    </div>
                    <div>
                      <select
                        aria-label="Customer contact"
                        disabled={contactsLoading || contacts.length === 0}
                        value={selectedContactId}
                        onChange={(event) => {
                          setSelectedContactId(event.target.value)
                          setConfirmationDeliveryMethod('')
                          setConfirmationSentTo('')
                        }}
                      >
                        <option value="">{contactsLoading ? 'Loading contacts…' : 'Select a contact'}</option>
                        {contacts.map((contact) => (
                          <option key={contact.contactid} value={contact.contactid}>
                            {getContactFullName(contact)}
                          </option>
                        ))}
                      </select>
                      {contactsLoading && <p className="contact-status"><Spinner size="tiny" />Loading account contacts…</p>}
                      {contactsError && <p className="contact-error"><Warning24Filled />{contactsError}</p>}
                    </div>
                  </Card>
                )}
                <div className="scan-layout">
                  <Card className="scanner-card">
                    {cameraOpen ? (
                      <div className="camera-stage"><video ref={videoRef} muted playsInline /><div className="scan-frame"><i /><i /><i /><i /></div><Badge className="camera-label">Looking for a tag…</Badge></div>
                    ) : (
                      <div className="scanner-empty"><div className="scanner-icon"><BarcodeScanner24Regular /></div><h3>Ready to scan</h3><p>Hold the tablet 6–12 inches from the equipment tag.</p><Button appearance="primary" size="large" icon={<Camera24Regular />} onClick={() => void startCamera(true)}>Open scanner</Button></div>
                    )}
                    {cameraError && <p className="inline-warning"><Warning24Filled />{cameraError}</p>}
                  </Card>
                  <div className="manual-card"><span>TAG DAMAGED?</span><h3>Enter the serial number</h3><p>Enter the manufacturer serial number exactly as shown on the equipment.</p><Input size="large" value={assetId} onChange={(_, data) => updateSerialNumber(data.value)} placeholder="Manufacturer serial number" /></div>
                </div>
                {assetId && (
                  <Card className={`asset-found asset-validation-${assetValidationStatus}`}>
                    {assetValidationStatus === 'matched' ? <CheckmarkCircle24Filled /> : <Warning24Filled />}
                    <div>
                      <span>ASSET VALIDATION</span>
                      <h3>{identifiedAsset?.msftmfm_assetnumber || assetId}</h3>
                      <p>Manufacturer serial number: {identifiedAsset?.msftmfm_manufacturerserialnumber || assetId}</p>
                      {identifiedAsset?.msftmfm_manufacturerproductnumber && <p>Product number: {identifiedAsset.msftmfm_manufacturerproductnumber}</p>}
                      {assetValidationError && <p className="asset-validation-message">{assetValidationError}</p>}
                    </div>
                    <div className="asset-validation-actions">
                      <Button appearance="primary" size="large" icon={<ArrowRight24Regular />} iconPosition="after" disabled={assetValidationStatus !== 'matched' || !selectedContact} onClick={() => { stopCamera(); setStep('capture') }}>Start walk-around</Button>
                    </div>
                  </Card>
                )}
              </section>
            )}

            {step === 'capture' && (
              <section className="screen">
                <div className="screen-heading heading-row"><div><p className="eyebrow">STEP 2 OF 3 · {assetId}</p><h2>Capture as you walk</h2><p>Take multiple photos or record a walk-around video of the asset.</p></div><Badge appearance="filled" color="brand">{captures.length} captured</Badge></div>
                {cameraOpen ? (
                  <Card className={`live-camera ${isRecordingVideo ? 'recording-video' : ''}`}><video ref={videoRef} muted playsInline /><div className="camera-hud"><Badge appearance="filled">{cameraMode === 'video' ? isRecordingVideo ? 'Recording walk-around' : 'Video ready' : activeCapture === 'asset' ? `${assetCaptures.length} asset photos` : activeCapture === 'meter' ? 'Hour meter' : 'Fuel receipt'}</Badge>{cameraMode === 'video' ? <Button appearance="primary" size="large" icon={<Video24Regular />} onClick={isRecordingVideo ? stopCamera : startVideoRecording}>{isRecordingVideo ? 'Stop recording' : 'Start recording'}</Button> : <Button appearance="primary" shape="circular" size="large" aria-label="Take photo" icon={<Camera24Regular />} onClick={() => void takePhoto()} />} {!isRecordingVideo && <Button appearance="secondary" onClick={stopCamera}>{activeCapture === 'asset' ? 'Done' : 'Cancel'}</Button>}</div></Card>
                ) : (
                  <div className="capture-grid">
                    <Card className={`capture-card asset-media-card ${assetCaptures.length ? 'complete' : ''}`}>
                      <div className="capture-icon">{assetCaptures.length ? <Checkmark24Regular /> : <Camera24Regular />}</div>
                      <div className="capture-copy"><span>REQUIRED</span><h3>Asset photos</h3><p>{assetCaptures.length ? `${assetCaptures.length} media file${assetCaptures.length === 1 ? '' : 's'} added` : 'Take multiple photos or record a video'}</p></div>
                      <div className="asset-media-actions">
                        <Button appearance="primary" size="large" icon={<Camera24Regular />} disabled={photoAnalysisStatus === 'analyzing' || photoAnalysisStatus === 'consolidating'} onClick={() => startCapture('asset')}>Take photos</Button>
                        <Button appearance="secondary" size="large" icon={<Video24Regular />} disabled={photoAnalysisStatus === 'analyzing' || photoAnalysisStatus === 'consolidating'} onClick={openVideoRecorder}>Record video</Button>
                      </div>
                      {selectedAssetMedia && (
                        <div className="asset-carousel" aria-label="Captured asset media preview">
                          <div className="asset-preview">
                            {selectedAssetMedia.mediaType === 'video' ? <video src={selectedAssetMedia.mediaUrl} controls aria-label={selectedAssetMedia.title} /> : <img src={selectedAssetMedia.mediaUrl} alt={selectedAssetMedia.title} />}
                            {assetCaptures.length > 1 && <Button className="carousel-previous" appearance="secondary" shape="circular" icon={<ArrowLeft24Regular />} aria-label="Previous asset photo" title="Previous" onClick={() => showAdjacentAssetMedia(-1)} />}
                            {assetCaptures.length > 1 && <Button className="carousel-next" appearance="secondary" shape="circular" icon={<ArrowRight24Regular />} aria-label="Next asset photo" title="Next" onClick={() => showAdjacentAssetMedia(1)} />}
                            <Button className="carousel-delete" appearance="primary" icon={<Delete24Regular />} aria-label={`Delete ${selectedAssetMedia.title}`} title="Delete" disabled={selectedAssetMedia.assetAnalysisStatus === 'processing' || photoAnalysisStatus === 'consolidating'} onClick={() => void deleteAssetMedia(selectedAssetMedia.id)}>Delete</Button>
                          </div>
                          <div className="asset-thumbnails" aria-label="Captured media">
                            {assetCaptures.map((capture, index) => <Button className={`asset-thumbnail ${capture.id === selectedAssetMedia.id ? 'selected' : ''}`} appearance="subtle" aria-label={`Preview ${capture.title}`} key={capture.id} onClick={() => setSelectedAssetMediaId(capture.id)}>{capture.mediaType === 'video' ? <><video src={capture.mediaUrl} muted /><Video24Regular /></> : <img src={capture.mediaUrl} alt="" />}<span>{index + 1}</span></Button>)}
                          </div>
                          {selectedAssetMedia.mediaType === 'image' && selectedAssetMedia.assetAnalysisStatus && (
                            selectedAssetMedia.analysisSummary ? (
                              <div className="selected-photo-analysis">
                                <span>ANALYSIS SUMMARY · {selectedAssetMedia.photoId || selectedAssetMedia.title}</span>
                                <p>{selectedAssetMedia.analysisSummary}</p>
                              </div>
                            ) : (
                              <p className={`selected-photo-status ${selectedAssetMedia.assetAnalysisStatus === 'error' ? 'error' : ''}`}>
                                {selectedAssetMedia.assetAnalysisStatus === 'processing'
                                  ? 'Analyzing and saving this photo…'
                                  : selectedAssetMedia.analysisError || 'Analysis summary pending.'}
                              </p>
                            )
                          )}
                          {assetCaptures.some((capture) => capture.mediaType === 'image') && (
                            <div className="photo-analysis">
                              {failedAssetCapture && (
                                <Button
                                  appearance="secondary"
                                  size="large"
                                  disabled={assetPhotosProcessing || photoAnalysisStatus === 'consolidating'}
                                  onClick={() => void processAssetCapture(failedAssetCapture)}
                                >
                                  Retry {failedAssetCapture.title}
                                </Button>
                              )}
                              <Button
                                className={photoAnalysisStatus === 'complete' ? 'analysis-complete' : undefined}
                                appearance="primary"
                                size="large"
                                icon={assetPhotosProcessing || photoAnalysisStatus === 'consolidating' ? <Spinner size="tiny" /> : photoAnalysisStatus === 'complete' ? <Checkmark24Regular /> : <Search24Regular />}
                                disabled={!assetPhotosReady || photoAnalysisStatus === 'consolidating'}
                                onClick={() => void analyzePhotos()}
                              >
                                {assetPhotosProcessing ? 'Preparing photos…' : photoAnalysisStatus === 'consolidating' ? 'Consolidating results…' : photoAnalysisStatus === 'complete' ? 'Analysis complete' : photoAnalysisStatus === 'error' ? 'Retry consolidation' : 'Analyze photos'}
                              </Button>
                              {photoAnalysisProgress && <span>{photoAnalysisProgress}</span>}
                              {consolidatedPhotoAnalysisSummary && <p className="photo-analysis-result">{consolidatedPhotoAnalysisSummary}</p>}
                              {photoAnalysisError && <p className="photo-analysis-error"><Warning24Filled />{photoAnalysisError}</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                    <CaptureCard icon={<VehicleTruckProfile24Regular />} title="Hour meter" description={meterDescription} capture={captures.find((capture) => capture.type === 'meter')} required analyzing={meterAnalysisStatus === 'analyzing' || meterAnalysisStatus === 'saving'} onClick={() => startCapture('meter')} />
                    <CaptureCard icon={<Receipt24Regular />} title="Fuel receipt" description={receiptAnalysisStatus === 'analyzing' ? 'Validating receipt amount…' : receiptAnalysisStatus === 'saving' ? 'Saving fuel receipt…' : fuelAmount || (receiptAnalysisStatus === 'error' ? cameraError || 'The fuel receipt could not be processed' : 'Optional when returned full')} capture={captures.find((capture) => capture.type === 'receipt')} analyzing={receiptAnalysisStatus === 'analyzing' || receiptAnalysisStatus === 'saving'} onClick={() => startCapture('receipt')} />
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
                <div className="screen-actions"><Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => setStep('scan')}>Back</Button><Button appearance="primary" size="large" icon={<ArrowRight24Regular />} iconPosition="after" disabled={!meterReading || receiptAnalysisStatus === 'analyzing' || receiptAnalysisStatus === 'saving' || photoAnalysisStatus !== 'complete'} onClick={() => setStep('review')}>Review check-in</Button></div>
              </section>
            )}

            {step === 'review' && (
              <section className="screen review-screen">
                <div className="screen-heading heading-row"><div><p className="eyebrow">STEP 3 OF 3 · HUMAN CONFIRMATION</p><h2>Review what the app found</h2><p>Confirm the captured return details before saving.</p></div><Badge className="completion-badge" appearance="filled" icon={<Checkmark24Regular />}>Ready to confirm</Badge></div>
                <div className="review-layout">
                  <div className="summary-stack">
                    <Card className="summary-card"><div className="summary-title"><VehicleTruckProfile24Regular /><div><span>EQUIPMENT</span><h3>{identifiedAsset?.msftmfm_assetnumber || assetId}</h3><p>Serial {identifiedAsset?.msftmfm_manufacturerserialnumber || assetId} · Rental agreement {rentalAgreementNumber}</p></div></div></Card>
                    <Card className="summary-card"><div className="asset-photos-summary"><div className="summary-label"><Camera24Regular /><span>ASSET PHOTOS</span></div><h3>{captures.filter((c) => c.type === 'asset').length} media files</h3>{consolidatedPhotoAnalysisSummary && <p>{consolidatedPhotoAnalysisSummary}</p>}</div><div className="damage-list">{captures.filter((c) => c.type === 'asset').map((capture) => <div className="damage-row" key={capture.id}>{capture.mediaType === 'video' ? <video src={capture.mediaUrl} controls aria-label={capture.title} /> : <img src={capture.mediaUrl} alt={capture.title} />}<div><strong>{capture.mediaType === 'image' ? capture.photoId || capture.title : capture.title}</strong><small>{capture.mediaType === 'image' ? capture.analysisSummary || 'Analysis pending' : capture.file ? `${Math.max(1, Math.round(capture.file.size / 1024))} KB` : 'Asset walk-around'}</small></div><Badge color={capture.mediaType === 'image' && capture.conditionPhotoId ? 'success' : 'informative'}>{capture.mediaType === 'image' && capture.conditionPhotoId ? 'Analyzed' : 'Attached'}</Badge></div>)}</div></Card>
                    <Card className="summary-card">
                      <div className="field-grid">
                        <div className="review-field"><span>HOUR METER · OCR</span><strong>{meterReading}</strong></div>
                        <div className="review-field"><span>FUEL AMOUNT · DOCUMENT</span><strong>{fuelAmount || 'Not provided'}</strong></div>
                      </div>
                      {overageCost !== null && (
                        <div className="overage-summary">
                          <div><span>CONTRACTED HOURS</span><strong>{formatHours(contractedHours!)}</strong></div>
                          <div><span>OVERAGE HOURS</span><strong>{formatHours(overageHours)}</strong></div>
                          <div><span>RATE PER HOUR</span><strong>{formatCurrency(overageRatePerHour!)}</strong></div>
                          <div className="overage-total"><span>OVERAGE COST</span><strong>{formatCurrency(overageCost)}</strong></div>
                        </div>
                      )}
                      {meterReading && numericMeterReading === null && <p className="overage-error"><Warning24Filled /> Enter a valid decimal meter reading to calculate overage.</p>}
                      {overageHours > 0 && overageCost === null && <p className="overage-error"><Warning24Filled /> The rental agreement does not have an overage rate per hour.</p>}
                    </Card>
                    <Card className="summary-card"><div className="notes-field"><span><Mic24Regular /> VOICE NOTE · TRANSCRIPT</span><p className="review-note">{transcript || 'No voice note captured'}</p></div></Card>
                  </div>
                  <aside className="confirm-panel"><div className="confirm-check"><CheckmarkCircle24Filled /></div><h3>Everything look right?</h3><p>Review the return details, then have the customer sign below before confirming.</p><div className="confirm-facts"><span><Checkmark24Regular /> Asset identified</span><span><Checkmark24Regular /> Meter ready to save</span><span><Checkmark24Regular /> Asset photos ready to submit</span><span><Checkmark24Regular /> Inspector: {currentUser.displayName}</span></div>{!isOnline && <div className="offline-callout"><WifiOff24Regular /><span><strong>You’re offline</strong>Reconnect before confirming this return.</span></div>}<small>Confirmation saves the return details and submits every related photo.</small></aside>
                </div>
                <Card className="summary-card contact-summary-card"><div className="summary-title"><Person24Regular /><div><span>CHECK-IN CONTACT</span><h3>{selectedContact && getContactFullName(selectedContact)}</h3><p>{[selectedContact?.emailaddress1, selectedContact?.mobilephone || selectedContact?.telephone1].filter(Boolean).join(' · ') || 'No email or phone on file'}</p></div></div></Card>
                <Card className="signature-card">
                  <div className="signature-heading">
                    <div><span>CUSTOMER SIGNATURE · REQUIRED</span><h3>Sign to confirm the equipment return</h3><p>Use a finger, stylus, or mouse to sign inside the box.</p></div>
                    <Button appearance="subtle" icon={<Delete24Regular />} disabled={!hasSignature || isConfirming} onClick={clearSignature}>Clear signature</Button>
                  </div>
                  <canvas
                    ref={signatureCanvasRef}
                    className="signature-canvas"
                    aria-label="Customer signature drawing area"
                    onPointerDown={startSignature}
                    onPointerMove={drawSignature}
                    onPointerUp={finishSignature}
                    onPointerCancel={finishSignature}
                  />
                  {!hasSignature && <small className="signature-hint">Customer signature is required.</small>}
                  {confirmationError && <p className="confirmation-error"><Warning24Filled />{confirmationError}</p>}
                </Card>
                <div className="screen-actions">
                  <Button appearance="subtle" icon={<ArrowLeft24Regular />} disabled={isConfirming} onClick={returnToCapture}>Back to capture</Button>
                  <Button
                    appearance="primary"
                    size="large"
                    icon={isConfirming ? <Spinner size="tiny" /> : <Checkmark24Regular />}
                    disabled={!isOnline || !hasSignature || numericMeterReading === null || (overageHours > 0 && overageCost === null) || isConfirming}
                    onClick={() => void confirmReturn()}
                  >
                    {isConfirming ? 'Confirming return…' : 'Confirm equipment return'}
                  </Button>
                </div>
              </section>
            )}

            {step === 'success' && (
              <section className="success-screen">
                <div className="success-icon"><Checkmark24Regular /></div>
                <p className="eyebrow">RETURN CHECKED IN</p>
                <h2>{assetId} is complete</h2>
                <p>The condition log is ready to sync with yard operations.</p>
                <Card className="receipt-card"><div><span>RETURN EVENT</span><strong>{returnId}</strong></div><div><span>CHECKED IN</span><strong>{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong></div><div><span>STATUS</span><Badge color="success">Ready to sync</Badge></div></Card>
                <Card className="delivery-card">
                  <span>CHECK-IN CONFIRMATION</span>
                  <h3>How would {selectedContact ? getContactFullName(selectedContact) : 'the customer'} like to receive confirmation?</h3>
                  <RadioGroup
                    aria-label="Confirmation delivery method"
                    value={confirmationDeliveryMethod}
                    onChange={(_, data) => {
                      setConfirmationDeliveryMethod(data.value as ConfirmationDeliveryMethod)
                      setConfirmationSentTo('')
                    }}
                  >
                    <Radio
                      value="text"
                      disabled={!selectedContact?.mobilephone && !selectedContact?.telephone1}
                      label={`Text message · ${selectedContact?.mobilephone || selectedContact?.telephone1 || 'No phone number on file'}`}
                    />
                    <Radio
                      value="email"
                      disabled={!selectedContact?.emailaddress1}
                      label={`Email · ${selectedContact?.emailaddress1 || 'No email address on file'}`}
                    />
                  </RadioGroup>
                  {!selectedContact?.emailaddress1 && !selectedContact?.mobilephone && !selectedContact?.telephone1 && (
                    <p className="contact-error"><Warning24Filled />This contact has no email address or phone number on file.</p>
                  )}
                  <Button
                    appearance="primary"
                    icon={<Send24Regular />}
                    disabled={!confirmationDeliveryValue}
                    onClick={() => setConfirmationSentTo(confirmationDeliveryValue)}
                  >
                    Send confirmation
                  </Button>
                  {confirmationSentTo && (
                    <p className="delivery-confirmation" role="status"><CheckmarkCircle24Filled />Confirmation sent to <strong>{confirmationSentTo}</strong></p>
                  )}
                </Card>
                <Button appearance="primary" size="large" icon={<VehicleTruckProfile24Regular />} onClick={returnToBookings}>Back to outstanding returns</Button>
              </section>
            )}
          </main>
      </div>
      <canvas ref={canvasRef} hidden />
    </>
  )
}

function CaptureCard({ icon, title, description, capture, required, analyzing, onClick }: { icon: React.ReactNode; title: string; description: string; capture?: Capture; required?: boolean; analyzing?: boolean; onClick: () => void }) {
  return <Card className={`capture-card ${capture && !analyzing ? 'complete' : ''}`}><div className="capture-icon">{analyzing ? <Spinner size="tiny" /> : capture ? <Checkmark24Regular /> : icon}</div><div className="capture-copy"><span>{required ? 'REQUIRED' : 'OPTIONAL'}</span><h3>{title}</h3><p>{description}</p></div>{capture && <div className="single-capture-preview"><img src={capture.mediaUrl} alt={`${title} preview`} /></div>}<Button appearance={capture ? 'secondary' : 'primary'} size="large" icon={<Camera24Regular />} disabled={analyzing} onClick={onClick}>{analyzing ? 'Validating' : capture ? 'Retake' : 'Capture'}</Button></Card>
}

export default CheckInPage
