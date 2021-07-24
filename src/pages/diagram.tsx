import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import * as HighCharts from 'highcharts';
import networkgraph from 'highcharts/modules/networkgraph'
import HighchartsReact from "highcharts-react-official";
import { useSelector } from "react-redux";
import { RootState } from "../reducers";
import { COL_MODE_REL } from "../constants/config";
import toast_msg from "../components/common/toast";
import { MSG_RELATION_ERROR } from "../constants/messages";
import SpinnerComponent from "../components/common/spinner";

const Diagram = () => {

	const tables: any = useSelector((state: RootState) => state.table);
	const loaded: any = useSelector((state: RootState) => state.loading.loaded);

	const [chartSettings, setChartSettings] = useState(null);
	const [nodes, setNodes] = useState([]);

	useEffect(() => {
		if (tables.data.length) {
			let nodes = [];

			for (let table of tables.data) {

				for (let header of table.headers) {
					if (header.type == COL_MODE_REL) {
						let target_table = tables.data.find(t => t.unique_id == header.target_table_id);

						// Evaluate whether target_table exists and target_table also has relation to this table
						if (!target_table || !target_table.headers.find(t => t.type == COL_MODE_REL && t.target_table_id == table.unique_id)) {
							toast_msg(MSG_RELATION_ERROR); continue;
						}

						// If there is already field in nodes
						if (nodes.find(g =>
							JSON.stringify(g) == JSON.stringify([table.name, target_table.name]) ||
							JSON.stringify(g) == JSON.stringify([target_table.name, table.name]))) continue;

						nodes.push([table.name, target_table.name]);
					}
				}
			}
			setNodes(nodes);
		}
	}, [tables]);

	useEffect(() => {
		if (!chartSettings && nodes.length) {
			networkgraph(HighCharts);

			const options = {
				chart: {
					type: "networkgraph",
					marginTop: 80
				},
				title: {
					text: "Table Relation"
				},
				plotOptions: {
					networkgraph: {
						keys: ["from", "to"],
						layoutAlgorithm: {
							enableSimulation: true,
							linkLength: 133,
							integration: "verlet",
							approximation: "barnes-hut",
							gravitationalConstant: 0.8
						}
					}
				},
				series: [
					{
						marker: {
							radius: 20
						},
						dataLabels: {
							enabled: true,
							linkFormat: "",
							allowOverlap: true
						},
						data: nodes
						// data: [
						// 	["Node 1", "Node 2"],
						// 	["Node 1", "Node 3"],
						// 	["Node 1", "Node 4"],
						// 	["Node 4", "Node 5"],
						// 	["Node 2", "Node 5"]
						// ]
					}
				]
			};
			setChartSettings(options);
		}
	}, [chartSettings, nodes]);


	return <>
		<div className="h-screen flex overflow-hidden bg-white">
			<Sidebar />
			<div className="flex flex-col w-0 flex-1 overflow-hidden relative">
				{
					!loaded ? <SpinnerComponent />
						:
						<main className="flex-1 relative z-0 overflow-y-auto focus:outline-none c-bg-table">
							<div className="py-6">
								<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
									<div className="container mx-auto px-4 sm:px-6 lg:px-20">
										<h1 className="text-2xl font-semibold text-gray-900">Relation Graph</h1>
										<div className="flow-root mt-4">
											{
												chartSettings && <HighchartsReact containerProps={{ style: { height: '500px' } }} highcharts={HighCharts} options={chartSettings} />
												// <Chart type='Chart' options={chartSettings}/>
											}
										</div>
									</div>
								</div>
							</div>
						</main>
				}
			</div>
		</div>
	</>
}

export default Diagram;