var checkboxValues=JSON.parse(localStorage.getItem("checkboxValues"))||{},$checkboxes=$(".round :checkbox");$checkboxes.on("change",(function(){$checkboxes.each((function(){checkboxValues[this.id]=this.checked})),localStorage.setItem("checkboxValues",JSON.stringify(checkboxValues))})),$.each(checkboxValues,(function(e,c){$("#"+e).prop("checked",c)}));