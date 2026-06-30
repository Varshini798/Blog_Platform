import 'dotenv/config'
import express from 'express'
import path from 'path'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoSanitize from 'express-mongo-sanitize'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import reportRoutes from './routes/reportRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
const devOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  process.env.CLIENT_URL,
].filter(Boolean))

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (devOrigins.has(origin)) return cb(null, true)
      if (process.env.NODE_ENV !== 'production') return cb(null, true)
      return cb(null, devOrigins.has(origin))
    },
    credentials: true,
  })
)
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(mongoSanitize())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reports', reportRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API http://localhost:${port}`))
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
