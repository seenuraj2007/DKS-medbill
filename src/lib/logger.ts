type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  userId?: string
  path?: string
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'
  private userId?: string
  private path?: string

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupClientLogger()
    }
  }

  setUser(userId: string) {
    this.userId = userId
  }

  setPath(path: string) {
    this.path = path
  }

  private setupClientLogger() {
    window.addEventListener('error', (event) => {
      this.error('Unhandled error', event.error)
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', event.reason)
    })
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      path: this.path
    }
  }

  private sendToLogging(entry: LogEntry) {
    if (this.isProduction) {
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true
      }).catch(() => {})
    }
  }

  error(message: string, error?: any) {
    const entry = this.formatMessage('error', message, {
      error: error?.message || error?.toString(),
      stack: error?.stack
    })

    if (this.isProduction) {
      this.sendToLogging(entry)
    } else {
      console.error(`[${entry.timestamp}] ERROR:`, message, error)
    }
  }

  warn(message: string, data?: any) {
    const entry = this.formatMessage('warn', message, data)

    if (this.isProduction) {
      this.sendToLogging(entry)
    } else {
      console.warn(`[${entry.timestamp}] WARN:`, message, data)
    }
  }

  info(message: string, data?: any) {
    const entry = this.formatMessage('info', message, data)

    if (this.isProduction) {
      this.sendToLogging(entry)
    } else {
      console.info(`[${entry.timestamp}] INFO:`, message, data)
    }
  }

  debug(message: string, data?: any) {
    if (this.isProduction) return

    const entry = this.formatMessage('debug', message, data)
    console.debug(`[${entry.timestamp}] DEBUG:`, message, data)
  }
}

export const logger = new Logger()