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
	const [postContent, setPostContent] = React.useState("");
	const [postClass, setPostClass] = React.useState("");
	var sortedAnnotations = post?.annotations?.reduce((unique, o) => {
		if(!unique.some(obj => obj.refers_to[0].name === o.refers_to[0].name)) {
		  unique.push(o);
		}
		let sortedunique = unique.slice().sort((a, b) => a.refers_to[0].name.toLowerCase().localeCompare(b.refers_to[0].name.toLowerCase()))
		return sortedunique;
	},[]);

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

	React.useEffect(() => {
		const content = (validateHtml(converter.makeHtml(
			search(post.raw, fragments)
		)));
		setPostContent(content);
		if (content.indexOf("frag-sep") > -1) {
			if (isFirstTime) {
				setPostClass("faded faded-with-animation");
			}
			else {
				setPostClass("faded");
			}
		}
		else {
			setPostClass("");
		}
	}, [fragments, post.raw]);

	return (
		<div id={`p${post.id}`}>
			<p
				style={{
					whiteSpace: "pre-line",
					paddingBottom: 10,
					margin: "20px 0px",
				}}
				className={postClass}
			>
				{ReactHtmlParser(postContent)}
			</p>
			<br />
			{post?.annotations?.length > 0 && (
				<CollapseAbleTable
					defaultIsCollapsed={true}
					header={
						<tr></tr>
					}
					data={sortedAnnotations}
					rowRenderer={(row) =>
						row.refers_to.map((item, i) => (
							<React.Fragment key={item.id}>
								<span 
									className="unselectable"
								>
									<Link to={`/codes/${item.id}`}>
										{item.name.toLowerCase()} 
									</Link>
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
											<span> [hide]</span> :
											<span> [see]</span>
										}
									</span>
									<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
								</span>
							</React.Fragment>
						))
					}
				/>
			)}
		</div>
	);
}

export default ThreadPost;