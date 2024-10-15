'use client';

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
import { UserPlus, Gift } from 'lucide-react';

export default function InstagramGiveawayUI() {
	const [timeLeft, setTimeLeft] = useState(259200); // 3 days in seconds
	const [isFollowing, setIsFollowing] = useState(false);
	const [isEntered, setIsEntered] = useState(false);

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
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-4">
						<Avatar>
							<AvatarImage src="/placeholder.svg" alt="@giveaway_account" />
							<AvatarFallback>GA</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle className="text-lg">Epic Giveaway!</CardTitle>
							<CardDescription>@okzeeyou</CardDescription>
						</div>
					</div>
					<Button variant={isFollowing ? 'secondary' : 'default'} size="sm" onClick={handleFollow}>
						{isFollowing ? 'Following' : 'Follow'}
						{!isFollowing && <UserPlus className="w-4 h-4 ml-2" />}
					</Button>
				</div>
				<CardDescription>Enter for a chance to win amazing prizes</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Button
						onClick={handleEnterGiveaway}
						className="w-full"
						disabled={isEntered || !isFollowing}
					>
						{isEntered ? 'Entered' : 'Enter Giveaway'}
						<Gift className="w-4 h-4 ml-2" />
					</Button>
					{!isFollowing && (
						<p className="text-sm text-center text-muted-foreground">
							You must follow @okzeeyou to enter the giveaway
						</p>
					)}
				</div>
				<Separator className="my-4" />
				<div className="space-y-2">
					<h3 className="font-semibold">Prizes:</h3>
					<ul className="list-disc list-inside space-y-1">
						<li>
							<Badge variant="secondary" className="mr-2">
								1st
							</Badge>
							3 free nights in our hotel
						</li>
						<li>
							<Badge variant="secondary" className="mr-2">
								2nd
							</Badge>
							Free room upgrade
						</li>
						<li>
							<Badge variant="secondary" className="mr-2">
								3rd
							</Badge>
							Free half-board meal plan during your stay
						</li>
					</ul>
				</div>
			</CardContent>
			<CardFooter>
				<div className="w-full text-center">
					<p className="text-sm text-muted-foreground">Giveaway ends in:</p>
					<p className="text-2xl font-bold">{formatTime(timeLeft)}</p>
				</div>
			</CardFooter>
		</Card>
	);
}
