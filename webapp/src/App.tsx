import React from 'react';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import Giveaway from '@/components/Giveaway';

const App: React.FC = () => {
	return (
		<body className="m-0 font-sans antialiased">
			<div className="container mx-auto p-4">
				<ConfettiEffect />
				<h1 className="text-3xl font-bold text-center mb-6">You are selected!</h1>
				<Giveaway />
			</div>
		</body>
	);
};

export default App;
