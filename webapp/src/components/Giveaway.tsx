import { useState, useEffect } from 'react';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Gift, UserPlus, Share2, Trophy, Clock, Users } from 'lucide-react';

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

	return (
		<Card className="w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 border-2 border-purple-200 dark:border-purple-800">
			<CardHeader className="space-y-1">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center space-x-2 sm:space-x-4">
						<Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-purple-500">
							<AvatarImage src="/placeholder.svg" alt="@okzeeyou" />
							<AvatarFallback>EG</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
								Exclusive Giveaway!
							</CardTitle>
							<CardDescription className="text-sm sm:text-base font-medium">
								@okzeeyou
							</CardDescription>
						</div>
					</div>
				</div>
				<CardDescription className="text-center text-sm sm:text-lg font-semibold text-purple-600 dark:text-purple-400">
					You've been specially selected!
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 sm:space-y-4">
				<div className="space-y-2">
					<h3 className="font-bold text-base sm:text-lg flex items-center">
						<Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500" /> Grand Prizes:
					</h3>
					<ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
						<li className="flex items-center">
							<Badge
								variant="secondary"
								className="mr-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
							>
								1st
							</Badge>
							<span className="font-medium">Room Upgrade</span>
						</li>
						<li className="flex items-center">
							<Badge
								variant="secondary"
								className="mr-2 bg-gradient-to-r from-gray-400 to-gray-600 text-white"
							>
								2nd
							</Badge>
							<span className="font-medium">Spa Package</span>
						</li>
						<li className="flex items-center">
							<Badge
								variant="secondary"
								className="mr-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white"
							>
								3rd
							</Badge>
							<span className="font-medium">Free Dinner</span>
						</li>
					</ul>
				</div>
				<Separator className="my-2 sm:my-4" />
				<div className="space-y-2">
					<h4 className="font-semibold text-sm sm:text-base flex items-center">
						<Users className="w-4 h-4 mr-2" /> Exclusive Group:
					</h4>
					<Progress value={progress} className="w-full" />
					<p className="text-xs sm:text-sm text-center text-muted-foreground">
						{progress}% of selected users have joined
					</p>
				</div>
				<div className="space-y-2">
					<Button
						onClick={handleFollow}
						variant={isFollowing ? 'secondary' : 'default'}
						className="w-full text-sm sm:text-base"
					>
						{isFollowing ? 'Following' : 'Follow to Join'}
						<UserPlus className="w-4 h-4 ml-2" />
					</Button>
					<Button
						onClick={handleEnterGiveaway}
						className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm sm:text-base"
						disabled={isEntered || !isFollowing}
					>
						{isEntered ? "You're In!" : 'Enter Giveaway'}
						<Gift className="w-4 h-4 ml-2" />
					</Button>
				</div>
				{!isFollowing && (
					<p className="text-xs sm:text-sm text-center text-muted-foreground">
						Follow @okzeeyou to unlock your entry
					</p>
				)}
				<Button variant="outline" className="w-full text-sm sm:text-base">
					Share with Friends
					<Share2 className="w-4 h-4 ml-2" />
				</Button>
			</CardContent>
			<CardFooter>
				<div className="w-full text-center space-y-1">
					<p className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center justify-center">
						<Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Offer Ends In:
					</p>
					<p className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
						{formatTime(timeLeft)}
					</p>
				</div>
			</CardFooter>
		</Card>
	);
}
