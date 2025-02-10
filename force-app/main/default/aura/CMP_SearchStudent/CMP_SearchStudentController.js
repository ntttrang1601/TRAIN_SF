({
    doInit: function(component, event, helper) {
        console.log("doInit được gọi.");
        helper.loadClassOptions(component);
        helper.loadGenderOptions(component);
        helper.search(component);
        // helper.loadStudents(component);
    },
    handleRefreshStudentList: function(component, event, helper) {
        console.log("Sự kiện refresh đã được nhận.");
        helper.search(component);  // Gọi lại hàm tìm kiếm
    },
    handleSearch : function(component, event, helper) {
        component.set("v.pageNumber", 1);
        helper.search(component);
    },
    checkSearchInputs: function(component) {
        var studentCode = component.get("v.studentCode");
        var searchName = component.get("v.searchName");
        var classCode = component.get("v.classCode");
        var gender = component.get("v.gender");
        var birthDate = component.get("v.birthDate");
    
        var isDisabled = !(studentCode || searchName || classCode || gender || birthDate);
        component.set("v.isClearDisabled", isDisabled);
    },
    

    handleClear : function(component, event, helper) {
        // Reset all search fields
        component.set("v.studentCode", "");
        component.set("v.searchName", "");
        component.set("v.classCode", "");
        component.set("v.gender", "");
        component.set("v.birthDate", null);
        component.set("v.isClearDisabled", true);
        
        // Reset pagination
        //component.set("v.pageNumber", 1);
        
        // Perform search with cleared filters
        //helper.search(component);
    },
  
    handleCreate : function(component, event, helper) {
        component.set("v.showCreateModal", true);
    },
    
    closeAllModal : function(component, event, helper) {
        console.log("Sự kiện closeCreateModal đã được nhận.");
        component.set("v.showCreateModal", false);
        console.log("Sự kiện closeViewModal đã được nhận.");
        component.set("v.showViewModal", false);
        console.log("Sự kiện closeEditModal đã được nhận.");
        component.set("v.showEditModal", false);
    },

    handleView: function(component, event, helper) {
        let studentId = event.getSource().get("v.value");
        component.set("v.selectedStudentId", studentId);
        component.set("v.showViewModal", true);
    },
    
    handleEdit: function(component, event, helper) {
        let studentId = event.getSource().get("v.value");
        component.set("v.selectedStudentId", studentId);
        component.set("v.showEditModal", true);
    },
    handleDelete : function(component, event, helper) {
        var studentId = event.getSource().get("v.value");
        component.set("v.deleteId", studentId);
        component.set("v.showDeleteModal", true);
    },
    
    handleDeleteSelected : function(component, event, helper) {
        var selectedIds = component.get("v.selectedIds");
        if (selectedIds && selectedIds.length > 0) {
            component.set("v.showDeleteModal", true);
        } else {
            helper.showToast('Warning', 'Please select the students you want to delete.', 'warning');
        }
    },
    confirmDelete : function(component, event, helper) {
        var deleteId = component.get("v.deleteId");
        var selectedIds = component.get("v.selectedIds");
        
        if (deleteId) {
            // Xóa đơn
            helper.deleteStudent(component, deleteId);
        } else if (selectedIds && selectedIds.length > 0) {
            // Xóa hàng loạt
            helper.deleteStudents(component, selectedIds);
        }
        
        component.set("v.showDeleteModal", false);
        component.set("v.deleteId", null);
    },
    
    closeDeleteModal : function(component, event, helper) {
        component.set("v.showDeleteModal", false);
        component.set("v.deleteId", null);
    },

    handleSelectAll : function(component, event, helper) {
        var selectAll = component.get("v.selectedAll");
        var students = component.get("v.students");
        var selectedIds = component.get("v.selectedIds");
        
        students.forEach(function(student) {
            student.selected = selectAll;
            var index = selectedIds.indexOf(student.Id);
            if (selectAll && index === -1) {
                selectedIds.push(student.Id);
            } else if (!selectAll && index > -1) {
                selectedIds.splice(index, 1);
            }
        });
        
        component.set("v.students", students);
        component.set("v.selectedIds", selectedIds);
    },
    handleCheckboxChange : function(component, event, helper) {
        var selectedId = event.getSource().get("v.value");
        var students = component.get("v.students");
        var selectedIds = component.get("v.selectedIds");
        var isSelected = event.getSource().get("v.checked");
        
        // Update selectedIds array
        var index = selectedIds.indexOf(selectedId);
        if (isSelected && index === -1) {
            selectedIds.push(selectedId);
        } else if (!isSelected && index > -1) {
            selectedIds.splice(index, 1);
        }
        
        // Update student selection status
        students.forEach(function(student) {
            if (student.Id === selectedId) {
                student.selected = isSelected;
            }
        });
        
        // Update selectedAll status
        component.set("v.selectedAll", students.length === selectedIds.length);
        component.set("v.selectedIds", selectedIds);
        component.set("v.students", students);
    },
    handleFirst : function(component, event, helper) {
        component.set("v.pageNumber", 1);
        helper.search(component);
    },
    
    handlePrevious : function(component, event, helper) {
        var pageNumber = component.get("v.pageNumber");
        component.set("v.pageNumber", pageNumber - 1);
        helper.search(component);
    },
    
    handleNext : function(component, event, helper) {
        var pageNumber = component.get("v.pageNumber");
        component.set("v.pageNumber", pageNumber + 1);
        helper.search(component);
    },
    
    handleLast : function(component, event, helper) {
        var totalPages = component.get("v.totalPages");
        component.set("v.pageNumber", totalPages);
        helper.search(component);
    },
    
    handlePageChange : function(component, event, helper) {
        var pageNumber = parseInt(event.getSource().get("v.value"));
        component.set("v.pageNumber", pageNumber);
        helper.search(component);
    }
})