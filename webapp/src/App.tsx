import React from 'react';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import Giveaway from '@/components/Giveaway';

const App: React.FC = () => {
	return (
		<div className="container mx-auto p-4">
			<ConfettiEffect />
			<h1 className="text-3xl font-bold text-center mb-6">Instagram Giveaway</h1>
			<Giveaway />
		</div>
	);
};

export default App;
