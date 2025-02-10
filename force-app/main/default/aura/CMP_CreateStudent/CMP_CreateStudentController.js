
({
    doInit: function (component, event, helper) {
        // Tạo đối tượng `Student__c` trống từ phía client
        component.set("v.student", {
            'sobjectType': 'Student__c',
            'Lastname__c': '',
            'Firstname__c': '',
            'Birthday__c': null,
            'Gender__c': null,
            'Class_look__c': null,
            'LearningStatus__c': null
        });
        
        // Lấy giá trị picklist cho Gender__c
        helper.fetchPicklistValues(component, "Student__c", "Gender__c", "genderOptions");

        // Lấy giá trị picklist cho Class_look__c
        helper.fetchClassLookupRecords(component);

        // Lấy giá trị picklist cho LearningStatus__c
        helper.fetchPicklistValues(component, "Student__c", "LearningStatus__c", "learningStatusOptions");
    },

    fireCloseModalEvent : function(component, event, helper) {
        var closeModalEvent = component.getEvent("closeModalEvent");
        closeModalEvent.fire();
        console.log("Sự kiện closeModalEvent đã được gửi.");
    },
    

    // handleSave: function (component, event, helper) {
    //     var student = component.get("v.student");
        
    //     // Kiểm tra các trường dữ liệu không được null
    //     if (!student.Lastname__c || !student.Firstname__c || !student.Birthday__c || !student.Gender__c || !student.Class_look__c) {
    //         $A.get("e.force:showToast").setParams({
    //             title: "Error",
    //             message: "Please fill in all required fields.",
    //             type: "error"
    //         }).fire();
    //         return;
    //     }

    //     // Kiểm tra nếu ngày sinh lớn hơn 18 tuổi
    //     var birthDate = new Date(student.Birthday__c);
    //     var today = new Date();
    //     var age = today.getFullYear() - birthDate.getFullYear();
    //     var m = today.getMonth() - birthDate.getMonth();

    //     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    //         age--;
    //     }

    //     if (age < 18) {
    //         $A.get("e.force:showToast").setParams({
    //             title: "Error",
    //             message: "The student must be at least 18 years old.",
    //             type: "error"
    //         }).fire();
    //         return;
    //     }

    //     // Gọi helper để lưu dữ liệu nếu các kiểm tra trên đều thành công
    //     helper.saveStudent(component);
    // },
    handleSave: function (component, event, helper) {
        var isValid = true;
    
        // Lấy tất cả input fields cần kiểm tra
        var lastnameField = component.find("lastname");
        var firstnameField = component.find("firstname");
        var birthdayField = component.find("birthday");
        var genderField = component.find("gender");
        var classField = component.find("class");
        var statusField = component.find("learningStatus");
    
        // Kiểm tra hợp lệ từng trường
        if (!lastnameField.get("v.value")) {
            lastnameField.reportValidity();
            isValid = false;
        }
    
        if (!firstnameField.get("v.value")) {
            firstnameField.reportValidity();
            isValid = false;
        }
    
        if (!birthdayField.get("v.value")) {
            birthdayField.reportValidity();
            isValid = false;
        } else {
            // Kiểm tra nếu ngày sinh dưới 18 tuổi
            var birthDate = new Date(birthdayField.get("v.value"));
            var today = new Date();
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
    
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
    
            if (age < 18) {
                birthdayField.setCustomValidity("学生は18歳以上でなければなりません。"); // Hiển thị lỗi trên input
                birthdayField.reportValidity();
                isValid = false;
            } else {
                birthdayField.setCustomValidity(""); // Xóa lỗi nếu hợp lệ
                birthdayField.reportValidity();
            }
        }
    
        // Kiểm tra gender (combobox)
        if (!genderField.get("v.value")) {
            genderField.setCustomValidity("性別を選択してください。");
            genderField.reportValidity();
            isValid = false;
        } else {
            genderField.setCustomValidity("");
            genderField.reportValidity();
        }
    
        // Kiểm tra class (combobox)
        if (!classField.get("v.value")) {
            classField.setCustomValidity("クラスを選択してください。");
            classField.reportValidity();
            isValid = false;
        } else {
            classField.setCustomValidity("");
            classField.reportValidity();
        }
    
        // Kiểm tra learningStatus (combobox)
        if (!statusField.get("v.value")) {
            statusField.setCustomValidity("ステータスを選択してください。");
            statusField.reportValidity();
            isValid = false;
        } else {
            statusField.setCustomValidity("");
            statusField.reportValidity();
        }
    
        // Nếu có lỗi, dừng việc lưu
        if (!isValid) {
            return;
        }
    
        // Gọi helper để lưu dữ liệu nếu hợp lệ
        helper.saveStudent(component);
        setTimeout(function() {
            var refreshEvent = component.getEvent("RefreshStudentListEvent");
            refreshEvent.setParams({ "refresh": true });
            refreshEvent.fire();
            console.log("Sự kiện RefreshStudentListEvent đã được gửi.");
            
            var closeModalEvent = component.getEvent("closeModalEvent");
            closeModalEvent.fire();
            console.log("Sự kiện closeModalEvent đã được gửi.");
        }, 1000);
    },
    
    

    handleCancel: function(component, event, helper) {
        var closeModalEvent = component.getEvent("closeModalEvent"); // Lấy event từ component
        closeModalEvent.fire(); // Bắn event
        console.log("Sự kiện closeModalEvent đã được gửi.");
    }
});