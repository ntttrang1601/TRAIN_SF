public with sharing class ListCtrl {
    // Properties for search filters
    public String studentCode { get; set; }
    public String firstName { get; set; }
    public String lastName { get; set; }
    public String classCode { get; set; }
    public String gender { get; set; }
    public Date birthDate { get; set; }

    // Property for search results and selected students
    public List<Student__c> students { get; set; }
    public List<Id> selectedStudents { get; set; }  // List to store selected student IDs

    public class StudentWrapper {
        public Student__c student { get; set; }
        public Boolean selected { get; set; }
        
        public StudentWrapper(Student__c student) {
            this.student = student;
            this.selected = false;
        }
    }
    
    public List<StudentWrapper> studentWrappers { get; set; }

    // Pagination properties
    public Integer pageSize = 10;
    public Integer pageNumber { get; set; }
    public Integer totalRecords { get; set; }
    public Integer totalPages { get; set; }
    public String selectedStudentId { get; set; }
    public Integer selectedPage { get; set; }
    public List<Integer> pageNumbers { get; set; }
    
    public Boolean showDeleteModal { get; set; }
    public Boolean deleteSuccess { get; set; }
    
    // Add new properties
    public List<SelectOption> classOptions { get; set; }
    
    // Constructor
    public ListCtrl() {
        pageSize = 10;
        pageNumber = 1;
        students = new List<Student__c>();
        classOptions = new List<SelectOption>();
        loadClassOptions();
        search();
    }

    // Pagination methods
    public Boolean getHasPrevious() {
        return pageNumber > 1;
    }
    
    public Boolean getHasNext() {
        return pageNumber < totalPages;
    }
    
    public void first() {
        pageNumber = 1;
        search();
    }
    
    public void previous() {
        pageNumber = pageNumber - 1;
        search();
    }
    
    public void next() {
        pageNumber = pageNumber + 1;
        search();
    }
    
    public void last() {
        pageNumber = totalPages;
        search();
    }
    
    public void initializePagination() {
        String countQuery = 'SELECT COUNT() FROM Student__c';
        totalRecords = Database.countQuery(countQuery);
        totalPages = Math.ceil(totalRecords * 1.0 / pageSize).intValue();
        
        // Generate page numbers
        pageNumbers = new List<Integer>();
        Integer startPage = Math.max(1, pageNumber - 2);
        Integer endPage = Math.min(totalPages, pageNumber + 2);
        
        // Always show 5 pages if possible
        if (endPage - startPage < 4) {
            if (startPage == 1) {
                endPage = Math.min(5, totalPages);
            } else {
                startPage = Math.max(1, endPage - 4);
            }
        }
        
        for(Integer i = startPage; i <= endPage; i++) {
            pageNumbers.add(i);
        }
    }
    
    public void goToPage() {
        if(selectedPage != null && selectedPage > 0 && selectedPage <= totalPages) {
            pageNumber = selectedPage;
            search();
        }
    }

    // Action methods
    public PageReference viewStudent() {
        if(String.isNotBlank(selectedStudentId)) {
            PageReference pageRef = new PageReference('/apex/VF_DetailStudent');
            pageRef.getParameters().put('id', selectedStudentId);
            pageRef.setRedirect(true);
            return pageRef;
        }
        return null;
    }
    
    public PageReference createStudent() {
        PageReference pageRef = Page.VF_CreateStudent;
        pageRef.setRedirect(true);
        return pageRef;
    }
    
    public PageReference deleteSelected() {
        try {
            if(String.isNotBlank(selectedStudentId)) {
                // Single delete
                delete new Student__c(Id = selectedStudentId);
            } else {
                // Bulk delete (existing code)
                List<Id> studentIdsToDelete = new List<Id>();
                for(StudentWrapper wrapper : studentWrappers) {
                    if(wrapper.selected) {
                        studentIdsToDelete.add(wrapper.student.Id);
                    }
                }
                if(!studentIdsToDelete.isEmpty()) {
                    delete [SELECT Id FROM Student__c WHERE Id IN :studentIdsToDelete];
                }
            }
            
            // Refresh page
            PageReference pageRef = ApexPages.currentPage();
            pageRef.setRedirect(true);
            return pageRef;
            
        } catch(Exception e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR,
                '削除中にエラーが発生しました: ' + e.getMessage()
            ));
        }
        return null;
    }

    // Search method
    public void search() {
        String query = 'SELECT Id, Name, StudentCode__c, LastName__c, FirstName__c, ' +
                      'Birthday__c, Gender__c, Class_look__c, Class_look__r.Name ' +
                      'FROM Student__c WHERE Id != null';
        
        // Add filters
        if (String.isNotBlank(studentCode)) {
            query += ' AND StudentCode__c LIKE \'%' + String.escapeSingleQuotes(studentCode) + '%\'';
        }
        if (String.isNotBlank(lastName)) {
            query += ' AND LastName__c LIKE \'%' + String.escapeSingleQuotes(lastName) + '%\'';
        }
        if (String.isNotBlank(firstName)) {
            query += ' AND FirstName__c LIKE \'%' + String.escapeSingleQuotes(firstName) + '%\'';
        }
        if (String.isNotBlank(classCode)) {
            query += ' AND Class_look__c = :classCode';
        }
        if (String.isNotBlank(gender)) {
            query += ' AND Gender__c = \'' + String.escapeSingleQuotes(gender) + '\'';
        }
        if (birthDate != null) {
            query += ' AND Birthday__c = :birthDate';
        }
        
        try {
            // Execute query and wrap results
            studentWrappers = new List<StudentWrapper>();
            for(Student__c student : Database.query(query)) {
                studentWrappers.add(new StudentWrapper(student));
            }
        } catch(Exception e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR,
                'クエリエラー: ' + e.getMessage()
            ));
        }
    }

    // Clear filters
    public void clearFilters() {
        studentCode = '';
        lastName = '';
        firstName = '';
        classCode = '';
        gender = '';
        birthDate = null;
        search();
    }

    // Show delete modal
    public void showDeleteConfirmation() {
        if(checkSelection()) {
            showDeleteModal = true;
        }
    }
    
    // Cancel delete
    public void cancelDelete() {
        showDeleteModal = false;
    }
    
    // Confirm delete
    public void confirmDelete() {
        try {
            deleteSelected();
            showDeleteModal = false;
            deleteSuccess = true;
        } catch(Exception e) {
            deleteSuccess = false;
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR, 
                '削除中にエラーが発生しました。'
            ));
        }
    }
    
    private Boolean checkSelection() {
        for(StudentWrapper wrapper : studentWrappers) {
            if(wrapper.selected) {
                return true;
            }
        }
        return false;
    }

    // Add method to load class options
    private void loadClassOptions() {
        classOptions = new List<SelectOption>();
        classOptions.add(new SelectOption('', '--なし--'));
        for (Class__c classRecord : [SELECT Id, Name FROM Class__c ORDER BY Name]) {
            classOptions.add(new SelectOption(classRecord.Id, classRecord.Name));
        }
    }
}
