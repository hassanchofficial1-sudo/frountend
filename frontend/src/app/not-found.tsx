import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-secondary-900 dark:text-secondary-100">404</h1>
        <p className="text-xl text-secondary-500 dark:text-secondary-400 mt-4">Page not found</p>
        <Link href="/" className="mt-6 inline-block text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
          Go back home
        </Link>
      </div>
    </div>
  )
}