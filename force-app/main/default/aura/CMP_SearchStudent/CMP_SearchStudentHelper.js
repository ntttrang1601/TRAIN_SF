({
    loadClassOptions : function(component) {
        var action = component.get("c.getClassOptions");
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.classOptions", response.getReturnValue());
            } else {
                console.error("Error loading class options");
            }
        });
        $A.enqueueAction(action);
    },
    loadGenderOptions : function(component) {
        var action = component.get("c.getGenderOptions");
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.genderOptions", response.getReturnValue());
            } else {
                console.error("Error loading class options");
            }
        });
        $A.enqueueAction(action);
    },
    calculatePageNumbers : function(component) {
        var totalPages = component.get("v.totalPages");
        var currentPage = component.get("v.pageNumber");
        var pageNumbers = [];
        var maxPagesToShow = 5;
        
        var startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        var endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (var i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        component.set("v.pageNumbers", pageNumbers);
    },
    loadStudents : function(component) {
        var action = component.get("c.getStudents");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var students = response.getReturnValue();
                component.set("v.students", students);
                
                // Reset pagination
                component.set("v.pageNumber", 1); // Reset to first page
                component.set("v.totalRecords", students.length); // Update total records
                component.set("v.totalPages", Math.ceil(students.length / component.get("v.pageSize"))); // Calculate total pages
                
                // Update page numbers
                var pageNumbers = [];
                for (var i = 1; i <= component.get("v.totalPages"); i++) {
                    pageNumbers.push(i);
                }
                component.set("v.pageNumbers", pageNumbers);
            } else if (state === "ERROR") {
                var errors = response.getError();
                this.showToast('Error', '学生の取得中にエラーが発生しました。', 'error');
            }
        });
        $A.enqueueAction(action);
    },
    search : function(component) {
        var action = component.get("c.searchStudents");
        action.setParams({
            studentCode: component.get("v.studentCode"),
            searchName: component.get("v.searchName"),
            classCode: component.get("v.classCode"),
            gender: component.get("v.gender"),
            birthDate: component.get("v.birthDate"),
            pageSize: component.get("v.pageSize"),
            pageNumber: component.get("v.pageNumber")
        });
        
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var result = response.getReturnValue();
                if (result) {
                    var selectedIds = component.get("v.selectedIds") || [];
                    
                    // Maintain selection state
                    result.students.forEach(function(student) {
                        student.selected = selectedIds.indexOf(student.Id) > -1;
                    });
                    
                    component.set("v.students", result.students);
                    component.set("v.totalRecords", result.totalRecords);
                    component.set("v.totalPages", result.totalPages);
                    
                    // Update selectedAll status for current page
                    var allSelected = result.students.every(function(student) {
                        return student.selected;
                    });
                    component.set("v.selectedAll", allSelected);
                    
                    this.calculatePageNumbers(component);
                }
            }
        });
        
        $A.enqueueAction(action);
    },
    deleteStudent : function(component, studentId) {
        var action = component.get("c.deleteStudent");
        action.setParams({
            studentId: studentId
        });
    
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                this.showToast('Success', 'Student was successfully deleted.', 'success');
                this.search(component);
            } else if (state === "ERROR") {
                var errors = response.getError();
                this.showToast('Error', 'An error occurred during deletion.', 'error');
            }
        });
    
        $A.enqueueAction(action);
    },
    
    deleteStudents : function(component, studentIds) {
        var action = component.get("c.deleteStudents");
        action.setParams({
            studentIds: studentIds
        });
    
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                this.showToast('Success', 'Selected students were successfully deleted.', 'success');
                component.set("v.selectedIds", []);
                component.set("v.selectedAll", false);
                this.search(component);
            } else if (state === "ERROR") {
                var errors = response.getError();
                this.showToast('Error', 'An error occurred during deletion.', 'error');
            }
        });
    
        $A.enqueueAction(action);
    },
    showToast : function(title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type
        });
        toastEvent.fire();
    }
})