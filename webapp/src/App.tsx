import React from 'react';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import Giveaway from '@/components/Giveaway';

const App: React.FC = () => {
	return (
		<body className="m-0 font-sans antialiased">
			<ConfettiEffect />
			<div className="container mx-auto p-4">
				<Giveaway />
			</div>
		</body>
	);
};

export default App;
