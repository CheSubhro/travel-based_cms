
export const metadata = {
	title: "Travel CMS",
	description: "Travel Content Management System",
};

import "./globals.css";

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}