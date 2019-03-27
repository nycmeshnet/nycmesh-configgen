import React, { PureComponent } from "react";
import Mustache from "mustache";

export default class Script extends PureComponent {
	render() {
		const { config, template } = this.props;
		if (!template) return null;
		return (
			<div className="w-two-thirds-l w-100 overflow-x-scroll pa4 bg-bluec">
				<pre className="mv0">
					<code>{Mustache.render(template.content, config)}</code>
				</pre>
			</div>
		);
	}
}
