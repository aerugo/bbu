import React from "react";
import CollapseAbleTable from "./CollapseableTable";
import { Link } from "react-router-dom";
import { faEye} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactHtmlParser from "react-html-parser";
import { search } from "../../utils/string";

function ThreadPost({ post, converter }) {
	return (
		<div id={`p${post.id}`}>
			<p
				style={{
					whiteSpace: "pre-line",
					paddingBottom: 10,
					margin: "20px 0px",
				}}
			>
				{ReactHtmlParser(converter.makeHtml(
					search(post.raw, [`"Because you made a mistake," said Hakawati, all sense of reserve leaving his eyes. He is incensed.`])
				))}
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
									<FontAwesomeIcon icon={faEye} />
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