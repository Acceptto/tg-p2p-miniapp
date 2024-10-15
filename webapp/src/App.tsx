import React from 'react';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import Giveaway from '@/components/Giveaway';

const App: React.FC = () => {
	return (
		<div className="container mx-auto p-4">
			<ConfettiEffect />
			<Giveaway />
		</div>
	);
};

export default App;
