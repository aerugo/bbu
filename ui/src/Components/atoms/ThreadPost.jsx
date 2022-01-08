import React from "react";
import CollapseAbleTable from "./CollapseableTable";
import { Link } from "react-router-dom";
import { faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactHtmlParser from "react-html-parser";
import { search, validateHtml } from "../../utils/string";

function ThreadPost({ post, converter, initialAnnotation }) {

	const [searched, setSearched] = React.useState([]);
	const [fragments, setFragments] = React.useState(initialAnnotation ? [initialAnnotation] : []);
	const [isFirstTime, setIsFirstTime] = React.useState(true);

	React.useEffect(() => {

		if (isFirstTime) {
			if (initialAnnotation)
				setFragments([initialAnnotation]);
			return;
		}

		const fragments = post?.annotations?.map(item => (
			item?.refers_to?.map(code => searched.indexOf(code.id) > -1 ? code.annotations : [])
		))
		.flat()
		.flat()
		.map(fragment => fragment.quote);

		setFragments(fragments);

	}, [searched, initialAnnotation]);

	return (
		<div id={`p${post.id}`}>
			<p
				style={{
					whiteSpace: "pre-line",
					paddingBottom: 10,
					margin: "20px 0px",
				}}
			>
				{ReactHtmlParser(validateHtml(converter.makeHtml(
					search(post.raw, fragments)
				)))}
			</p>
			<br />
			{post?.annotations?.length > 0 && (
				<CollapseAbleTable
					defaultIsCollapsed={true}
					header={
						<tr>
							<td style={{ width: 40 }} />
							<td style={{ width: 40 }} />
							<td />
						</tr>
					}
					data={post?.annotations}
					rowRenderer={(row) =>
						row.refers_to.map((item) => (
							<React.Fragment key={item.id}>
								<td>
									<span className="circle-count">
										{item.annotations_count}
									</span>
								</td>
								<td>
									<span
										onClick={() => {
											if (searched.indexOf(item.id) > -1)
												searched.splice(searched.indexOf(item.id), 1);
											else
												searched.push(item.id);
											setSearched([...searched]);
											setIsFirstTime(false);
										}}
									>
										{
											(searched.indexOf(item.id) > -1) ?
											<FontAwesomeIcon icon={faEyeSlash} /> :
											<FontAwesomeIcon icon={faEye} />
										}
									</span>
								</td>
								<td>
									<Link to={`/codes/${item.id}`}>
										{item.name.toLowerCase()}
									</Link>
								</td>
							</React.Fragment>
						))
					}
				/>
			)}
		</div>
	);
}

export default ThreadPost;