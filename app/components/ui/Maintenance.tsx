export default function Maintenance() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Scheduled Maintenance
      </h1>
      <p className="max-w-2xl text-lg text-neutral-400">
        We are currently updating the platform to bring you a better experience. Please check back
        shortly.
      </p>

      <a
        href="https://minimal.adithyakrishnan.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 text-sm text-neutral-500 underline underline-offset-4 transition-colors hover:text-white"
      >
        In the meantime, feel free to check out my minimal portfolio.
      </a>

      <div className="mt-12 flex items-center justify-center space-x-2">
        <div className="h-3 w-3 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
        <div className="h-3 w-3 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
        <div className="h-3 w-3 animate-bounce rounded-full bg-white"></div>
      </div>
    </div>
  );
}
