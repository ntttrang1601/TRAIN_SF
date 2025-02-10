({
    doInit : function(component, event, helper) {
        var studentId = component.get("v.studentId");
        console.log("studentId: ", studentId);
        helper.getDataInit(component);
    },
    fireCloseModalEvent : function(component, event, helper) {
        var closeModalEvent = component.getEvent("closeModalEvent");
        closeModalEvent.fire();
        console.log("Sự kiện closeModalEvent đã được gửi.");
    },

})