import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center  text-gray-800 dark:text-white">
      <h1 className="mb-4 text-6xl md:text-8xl font-extrabold text-primary">404</h1>
      <h2 className="mb-6 text-2xl md:text-4xl font-bold">Page Not Found</h2>
      <p className="mb-8 text-lg">Sorry, we couldn’t find the page you were looking for.</p>

      <Link
        href="/"
        className="px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition duration-150 ease-in-out shadow-md"
      >
        Go back home
      </Link>
    </main>
  )
}
