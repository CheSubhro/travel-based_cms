export default function Home() {
	const appName = process.env.NEXT_PUBLIC_APP_NAME;

	return (
		<main className="min-h-screen flex items-center justify-center">
			<h1 className="text-4xl font-bold">{appName}</h1>
		</main>
  	);
}
