({
    doInit: function(component, event, helper) {
        var studentId = component.get("v.studentId");

        // Gọi helper để lấy thông tin sinh viên
        helper.fetchStudentData(component, studentId);
        // Lấy giá trị picklist cho Gender__c
        helper.fetchPicklistValues(component, "Student__c", "Gender__c", "genderOptions");

        // Lấy giá trị picklist cho Class_look__c
        helper.fetchClassLookupRecords(component);

        // Lấy giá trị picklist cho LearningStatus__c
        helper.fetchPicklistValues(component, "Student__c", "LearningStatus__c", "learningStatusOptions");
    },
    handleSave: function(component, event, helper) {
        // Lấy thông tin sinh viên từ component
        var student = component.get("v.student");
        var today = new Date(); // Ngày hiện tại
        var birthDate = new Date(student.Birthday__c);
    
        // Kiểm tra nếu các trường bắt buộc bị null
        if (!student.Lastname__c || !student.Firstname__c || !student.Birthday__c || !student.Gender__c || !student.Class_look__c) {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "ERROR",
                "message": "All required fields must be filled.",
                "type": "error"
            });
            toastEvent.fire();
            return;
        }
    
        // Kiểm tra tuổi (ngày sinh phải lớn hơn 18 tuổi)
        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
    
        if (age < 18) {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "ERROR",
                "message": "The student must be at least 18 years old.",
                "type": "error"
            });
            toastEvent.fire();
            return;
        }
    
        // Nếu không có lỗi, gọi helper để lưu dữ liệu
        helper.saveStudentData(component);
        setTimeout(function() {
            var refreshEvent = component.getEvent("RefreshStudentListEvent");
            refreshEvent.setParams({ "refresh": true });
            refreshEvent.fire();
            console.log("Sự kiện RefreshStudentListEvent đã được gửi.");
            
            var closeModalEvent = component.getEvent("closeModalEvent");
            closeModalEvent.fire();
            console.log("Sự kiện closeModalEvent đã được gửi.");
        }, 500);

    },
    fireCloseModalEvent : function(component, event, helper) {
        var closeModalEvent = component.getEvent("closeModalEvent");
        closeModalEvent.fire();
        console.log("Sự kiện closeModalEvent đã được gửi.");
    },
    
})