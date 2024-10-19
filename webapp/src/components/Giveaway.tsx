import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Gift, UserPlus, Share2, Clock, Plane, Hotel } from 'lucide-react';

const participants = [
	{ name: 'Olivia' },
	{ name: 'Emma' },
	{ name: 'Ava' },
	{ name: 'Sophia' },
	{ name: 'Isabella' },
	{ name: 'Mia' },
	{ name: 'Charlotte' },
	// Add more participants as needed
];

export default function Giveaway() {
	const [timeLeft, setTimeLeft] = useState(259200); // 3 days in seconds
	const [isFollowing, setIsFollowing] = useState(false);
	const [isEntered, setIsEntered] = useState(false);
	const [progress, setProgress] = useState(65);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const formatTime = (time: number) => {
		const days = Math.floor(time / 86400);
		const hours = Math.floor((time % 86400) / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = time % 60;
		return `${days}d ${hours}h ${minutes}m ${seconds}s`;
	};

	const handleFollow = () => {
		setIsFollowing(!isFollowing);
	};

	const handleEnterGiveaway = () => {
		setIsEntered(true);
		setProgress(prev => Math.min(prev + 5, 100));
	};

	const handleShare = async () => {
		if (!navigator.share) {
			alert(
				'Your browser does not support sharing. Please try on a mobile device or a different browser.'
			);
			return;
		}

		const imageUrl = '/giveaway-image.jpg'; // This path is relative to the public folder

		try {
			// Fetch the image from the public folder
			const response = await fetch(imageUrl);
			if (!response.ok) {
				throw new Error(`Failed to fetch image: ${response.statusText}`);
			}
			const blob = await response.blob();
			const file = new File([blob], 'giveaway-image.jpeg', { type: 'image/jpeg' });

			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({ files: [file] });
			} else {
				throw new Error('File sharing not supported on this device');
			}
		} catch (error) {
			console.error('Error sharing:', error);
			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					console.log('Share cancelled by the user');
				} else if (error.message === 'File sharing not supported on this device') {
					alert(
						'Your device does not support sharing image files. Please try on a different device.'
					);
				} else {
					alert(`Unable to share the image: ${error.message}`);
				}
			} else {
				alert('An unexpected error occurred. Please try again later.');
			}
		}
	};

	return (
		<Card className="w-full bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 mx-auto max-w-sm sm:max-w-md">
			<CardHeader className="space-y-1 text-center pb-4">
				<div className="flex items-center justify-center mb-4">
					<Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-blue-200 dark:border-blue-700">
						<AvatarImage
							src="https://plus.unsplash.com/premium_photo-1682800179180-fb326934d458?q=80&w=3271&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
							alt="@minimalist_travels"
						/>
						<AvatarFallback>MT</AvatarFallback>
					</Avatar>
				</div>
				<CardTitle className="text-xl sm:text-2xl font-light text-gray-800 dark:text-gray-100">
					Our Hotel Giveaway ✈️
				</CardTitle>
				<CardDescription className="text-sm font-medium text-blue-600 dark:text-blue-400">
					@okzeeyou
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 sm:space-y-6">
				<div className="bg-blue-50 dark:bg-blue-900 p-3 sm:p-4 rounded-lg shadow-sm text-center">
					<p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
						Giveaway Ends In:
					</p>
					<p className="text-lg sm:text-2xl font-light text-blue-800 dark:text-blue-200">
						{formatTime(timeLeft)}
					</p>
				</div>
				<p className="text-xs text-center text-gray-600 dark:text-gray-300">
					Win a serene escape to our minimalist resort 🏝️
				</p>
				<div className="grid grid-cols-3 gap-2 text-xs">
					<div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
						<Hotel className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
						<p className="font-medium text-gray-800 dark:text-gray-200 text-center">3-Night Stay</p>
					</div>
					<div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
						<Plane className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
						<p className="font-medium text-gray-800 dark:text-gray-200 text-center">Travel Kit</p>
					</div>
					<div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
						<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
						<p className="font-medium text-gray-800 dark:text-gray-200 text-center">Experiences</p>
					</div>
				</div>
				<Separator className="my-2 sm:my-4 bg-gray-200 dark:bg-gray-700" />
				<div className="space-y-2 sm:space-y-3">
					<h4 className="font-light text-base sm:text-lg text-center text-gray-800 dark:text-gray-200">
						Fellow Travelers 👥
					</h4>
					<div className="flex justify-center -space-x-2">
						{participants.slice(0, 5).map((participant, index) => (
							<Avatar
								key={index}
								className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white dark:border-gray-900"
							>
								<AvatarImage
									src={`https://i.pravatar.cc/150?img=${index + 1}`}
									alt={participant.name}
								/>
								<AvatarFallback>{participant.name[0]}</AvatarFallback>
							</Avatar>
						))}
						{participants.length > 5 && (
							<div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-900">
								+{participants.length - 5}
							</div>
						)}
					</div>
					<Progress value={progress} className="w-full h-1 bg-blue-100 dark:bg-blue-900" />
					<p className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400">
						{progress}% of invitees have joined the journey
					</p>
				</div>
				<div className="space-y-2 sm:space-y-3">
					<Button
						onClick={handleFollow}
						variant={isFollowing ? 'secondary' : 'default'}
						className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-gray-900 dark:hover:bg-blue-400 text-sm sm:text-base"
					>
						{isFollowing ? 'Following ✅' : 'Follow to Join 🤝'}
						<UserPlus className="w-4 h-4 ml-2" />
					</Button>
					<Button
						onClick={handleEnterGiveaway}
						className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 text-sm sm:text-base"
						disabled={isEntered || !isFollowing}
					>
						{isEntered ? 'Entered 🎉' : 'Enter Giveaway 🎁'}
						<Gift className="w-4 h-4 ml-2" />
					</Button>
				</div>
				{!isFollowing && (
					<p className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400">
						Follow @okzeeyou to participate 👀
					</p>
				)}
				<Button
					onClick={handleShare}
					variant="outline"
					className="w-full text-sm sm:text-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
				>
					Share with Travel Buddies 📢
					<Share2 className="w-4 h-4 ml-2" />
				</Button>
			</CardContent>
		</Card>
	);
}
