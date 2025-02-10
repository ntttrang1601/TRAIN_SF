({
    getDataInit : function(component) {
        try{
            component.set("v.student",null);
            let action = component.get("c.getStudent");
            var studentId = component.get("v.studentId");

            if(studentId){
                action.setParams({studentId: studentId});
                action.setCallback(this, function(response){
                    var state = response.getState();
                    if(state === "SUCCESS"){
                        var student = response.getReturnValue();
                        component.set("v.student",student);
                    }
                });
                $A.enqueueAction(action);
            }
        }
        catch(error){}
    }
})