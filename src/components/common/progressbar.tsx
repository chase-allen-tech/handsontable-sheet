import { useEffect, useState } from "react";

const ProgressBar = (props) => {

	const {
		is_show,
		setProgressBar,
	} = props;

	const [initTimer, setInitTimer] = useState(false);
	const [percent, setPercent] = useState(0);

	useEffect(() => {
		if(is_show) {
			setInitTimer(true);
		}
	}, [is_show]);


	useEffect(() => {
		if(initTimer) {
			console.log(globalThis.totalRequest, globalThis.rxRequest, globalThis.timer);
			if(globalThis.totalRequest == undefined || globalThis.rxRequest == undefined || globalThis.timer ) return;

			globalThis.timer = setInterval(() => {
				setPercent(Math.round(globalThis.rxRequest * 100 / globalThis.totalRequest));

				if(globalThis.rxRequest == globalThis.totalRequest) {
					globalThis.rxRequest = 0;
					globalThis.totalRequset = 0;
					clearInterval(globalThis.timer);
					globalThis.timer = undefined;
					setProgressBar(false);
				}
			}, 100);
			setInitTimer(false);
		}
	}, [initTimer]);

	return <>
		{
			is_show &&
			<div className="absolute h-full w-full flex justify-center items-center z-10">
				<div className="absolute h-full w-full bg-green-200 opacity-70"></div>
				<div className="relative pt-1">
					<div className="flex mb-2 items-center justify-between">
						<div>
							<span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200">
								Task in progress
          </span>
						</div>
						<div className="text-right">
							<span className="text-lg font-semibold inline-block text-pink-600">
								{percent}%
          </span>
						</div>
					</div>
					<div className="overflow-hidden h-5 mb-4 text-xs flex rounded bg-pink-200 w-96">
						<div style={{ width: `${percent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500"></div>
					</div>
				</div>
			</div>
		}
	</>
}

export default ProgressBar;