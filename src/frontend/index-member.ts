$(function(){
	linkify("a#install-add", `https://github.com/apps/${CommonConstants.ghApp.name}/installations/new`)

	ajax("listProfiles", <ListProfilesReq> {}, (response: ListProfilesRes) =>{
		const wrapper = $("#install-list")
		const template = $("#install-entry-template")
		const installations = response.installations
		for(const key in installations){
			const installId: number = parseInt(key)
			const installation: Installation = installations[installId]
			const div = template.clone()
				.removeAttr("id").removeClass("template").addClass("install-entry")
			div.find(".install-name").text(installation.account.login)
			div.find(".install-type").text(installation.target_type)
			div.find(".install-coverage-value").text(installation.repository_selection)
			div.find(".install-coverage-edit").attr("href", installation.html_url)
			div.find(".install-creationDate").attr("data-timestamp", new Date(installation.created_at).getTime())
			ajax("installDetails", <InstallDetailsReq> {installId: installId}, (response: InstallDetailsRes) =>{
				div.find(".install-coverage-count").text(`(${response.length})`)
				div.find(".install-coverage").attr("title", response.map(repo => repo.name).join(", "))
			})
			wrapper.append(div)
		}
		document.getElementById("install-list-loading").style.display = "none"
	})
})
