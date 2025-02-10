({
    fetchStudentData: function(component, studentId) {
        var action = component.get("c.getStudent");
        action.setParams({ studentId: studentId });
    
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var student = response.getReturnValue();
    
                // Kiểm tra các giá trị và gán "None" nếu không có
                student.Gender__c = student.Gender__c || "None";
                student.Class_look__c = student.Class_look__c || "None";
                student.LearningStatus__c = student.LearningStatus__c || "None";
    
                component.set("v.student", student);
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors && errors[0] && errors[0].message) {
                    console.error("Error: " + errors[0].message);
                }
            }
        });
    
        $A.enqueueAction(action);
    },
    fetchPicklistValues: function (component, objectName, fieldName, attributeName) {
        var action = component.get("c.getPicklistValues");
        
        // Thiết lập các tham số cho phương thức Apex
        action.setParams({
            objectName: objectName,
            fieldName: fieldName
        });
    
        // Đặt callback để xử lý kết quả trả về
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                var picklistValues = response.getReturnValue();
                var options = [];
                
                // Duyệt qua các giá trị picklist và tạo các object {label, value}
                for (var i = 0; i < picklistValues.length; i++) {
                    options.push({
                        label: picklistValues[i][0],  // Label từ phần tử thứ 0 của list
                        value: picklistValues[i][1]   // Value từ phần tử thứ 1 của list (API Name)
                    });
                }
    
                // Gán options vào thuộc tính của component
                component.set("v." + attributeName, options);
            } else {
                console.error("Error fetching picklist values: ", response.getError());
            }
        });
    
        // Thực hiện gọi action
        $A.enqueueAction(action);
    },
    
    fetchClassLookupRecords: function (component) {
        var action = component.get("c.getClassLookupRecords");
    
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                var classes = response.getReturnValue();
                var options = []; // Tạo danh sách trống
    
                // Lặp qua từng bản ghi và thêm label-value
                classes.forEach(function (cls) {
                    options.push({
                        label: cls.Name,
                        value: cls.Id
                    });
                });
    
                // Gán danh sách options vào classOptions
                component.set("v.classOptions", options);
            } else {
                console.error("Error fetching Class__c records: ", response.getError());
            }
        });
        $A.enqueueAction(action);
    },
    saveStudentData: function(component) {
        var student = component.get("v.student");
        var action = component.get("c.updateStudent");
    
        // Truyền dữ liệu sinh viên vào Apex method
        action.setParams({
            updatedStudent: student
        });
    
        // Đặt callback để xử lý kết quả trả về
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                // Hiển thị thông báo thành công
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "SUCCESS",
                    "message": "Student information has been successfully updated.",
                    "type": "success"
                });
                toastEvent.fire();
            } else if (state === "ERROR") {
                // Xử lý lỗi nếu có
                var errors = response.getError();
                if (errors && errors[0] && errors[0].message) {
                    console.error("Error: " + errors[0].message);
                }
            }
        });
    
        // Gửi action đến server
        $A.enqueueAction(action);
    },
    
})