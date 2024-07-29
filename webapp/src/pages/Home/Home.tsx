import React, { useState, useEffect, useCallback } from 'react';
import { useMiniApp, useMainButton, initPopup, initHapticFeedback } from '@telegram-apps/sdk-react';
import { useMutation } from '@tanstack/react-query';
import { Text, Spinner, Input, Tappable, List } from '@telegram-apps/telegram-ui';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';

//import { sendInputs } from '@/api'; // Assume this function handles the backend call
import styles from './Home.module.css';

interface HomeProps {
	token: string;
}

interface InputData {
	input1: string;
	input2: string;
	input3: string;
}

const Home: React.FC<HomeProps> = ({ token }) => {
	const miniapp = useMiniApp();
	const mainButton = useMainButton();
	const popup = initPopup();
	const [input1, setInput1] = useState('');
	const [input2, setInput2] = useState('');
	const [input3, setInput3] = useState('');

	// Initialize haptic feedback
	const hapticFeedback = initHapticFeedback();

	useEffect(() => {
		miniapp.ready();
	}, [miniapp]);

	const inputMutation = useMutation<void, Error, InputData>({
		mutationKey: ['sendInputs', token],
		mutationFn: async ({ input1, input2, input3 }) => {
			if (!token) {
				throw new Error('Token is required');
			}
			return console.log('Form submitted:', { input1, input2, input3 });
		},
		onSuccess: () => {
			miniapp.close(true);
		},
		onError: error => {
			popup
				.open({
					title: 'Error',
					message: `${error instanceof Error ? error.message : 'An error occurred'}. Please try again.`,
					buttons: [
						{ id: 'ok', type: 'default', text: 'OK' },
						{ id: 'retry', type: 'default', text: 'Retry' },
					],
				})
				.then((buttonId: string | null) => {
					if (buttonId === 'retry') {
						inputMutation.mutate({ input1, input2, input3 });
					}
				});
		},
	});

	const handleMainButtonClick = useCallback(() => {
		if (input1 && input2 && input3) {
			// Trigger haptic feedback
			hapticFeedback.impactOccurred('medium');

			inputMutation.mutate({ input1, input2, input3 });
		}
	}, [input1, input2, input3, inputMutation, hapticFeedback]);

	useEffect(() => {
		if (input1 && input2 && input3) {
			mainButton.setText('Submit');
			mainButton.show();
			if (inputMutation.isLoading) {
				mainButton.disable();
				mainButton.showLoader();
			} else {
				mainButton.enable();
				mainButton.hideLoader();
			}
			mainButton.on('click', handleMainButtonClick);
		} else {
			mainButton.hide();
		}
		return () => {
			mainButton.off('click', handleMainButtonClick);
		};
	}, [input1, input2, input3, inputMutation.isLoading, mainButton, handleMainButtonClick]);

	if (inputMutation.isLoading) {
		return <Spinner size="l" />;
	}

	return (
		<div className={styles.container}>
			<h2 className={styles.title}>Enter Information</h2>
			<List
				style={{
					width: 400,
					maxWidth: '100%',
					margin: 'auto',
				}}
			>
				<Input
					status="focused"
					header="Ключ"
					placeholder="ключ"
					value={input1}
					onChange={e => setInput1(e.target.value)}
					after={
						<Tappable
							Component="div"
							style={{
								display: 'flex',
							}}
							onClick={() => setInput1('')}
						>
							<Icon24Close />
						</Tappable>
					}
				/>
				<Input
					status="focused"
					header="Опис"
					placeholder="опис"
					value={input2}
					onChange={e => setInput2(e.target.value)}
					after={
						<Tappable
							Component="div"
							style={{
								display: 'flex',
							}}
							onClick={() => setInput2('')}
						>
							<Icon24Close />
						</Tappable>
					}
				/>
				<Input
					status="focused"
					header="Ціна"
					placeholder="ціна"
					value={input3}
					onChange={e => setInput3(e.target.value)}
					after={
						<Tappable
							Component="div"
							style={{
								display: 'flex',
							}}
							onClick={() => setInput3('')}
						>
							<Icon24Close />
						</Tappable>
					}
				/>
				<Text>
					{input1 && input2 && input3
						? "All fields are filled. Click 'Create Item' to submit."
						: 'Please fill in all fields to create a payable item.'}
				</Text>
			</List>
		</div>
	);
};

export default Home;
