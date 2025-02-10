public with sharing class VF_SearchStudentCtrl {
    // Danh sách sinh viên được lấy từ query
    public List<Student__c> students { get; set; }
    public String studentCodeKey { get; set; }
    public String searchStudentCode { get; set; }
    public String selectedStudentId { get; set; }
    public List<SelectOption> classOptions { get; set; }
    public String selectedStudentIds { get; set; }

    public Integer currentPage { get; set; } // Trang hiện tại
    public Integer pageSize { get; set; } // Số lượng bản ghi trên mỗi trang
    public Integer totalRecords { get; set; } // Tổng số bản ghi
    public Integer totalPages { get; set; } // Tổng số trang
    public List<Integer> pageNumbers { get; set; } // Danh sách số trang
    public Integer totalStudents { get; set; }
    // Đối tượng tìm kiếm
    public Student__c searchStudent { get; set; }
    public String selectedDay { get; set; }
    public String selectedMonth { get; set; }
    public String selectedYear { get; set; }
    // Constructor
    public VF_SearchStudentCtrl() {
        // Khởi tạo đối tượng tìm kiếm
        searchStudent = new Student__c();
        classOptions = new List<SelectOption>();
        currentPage = 1;
        StudentManageSetting__c settings = StudentManageSetting__c.getOrgDefaults();
        Integer maxRecords = Integer.valueOf(settings.S_MaxRecord__c) > 0
                ? Integer.valueOf(settings.S_MaxRecord__c)
                : 2000;
        pageSize = (settings != null && settings.S_RecordPerPage__c != null) ? (Integer)settings.S_RecordPerPage__c : 10;
        totalRecords = [SELECT COUNT() FROM Student__c];
        totalPages = (Integer)Math.ceil((Decimal)totalRecords / pageSize);
        pageNumbers = new List<Integer>();
        totalStudents = [SELECT COUNT() FROM Student__c];
        // Lấy danh sách sinh viên ban đầu
        //students = [SELECT Id, Name, StudentCode__c, FirstName__c, LastName__c, Birthday__c, Gender__c, Class_look__c FROM Student__c];
        loadClassOptions();
        students = new List<Student__c>();
        searchStudents();
    }

    public void loadClassOptions() {
        classOptions.add(new SelectOption('', '--なし--')); 
        for (Class__c classRecord : [SELECT Id, Name FROM Class__c ORDER BY Name]) {
            classOptions.add(new SelectOption(classRecord.Id, classRecord.Name));
        }
    }
    public void searchStudents() {
        String countQuery = 'SELECT COUNT() FROM Student__c';
            
        String query = 'SELECT Id, Name, StudentCode__c, FirstName__c, LastName__c, Birthday__c, Gender__c, Class_look__c FROM Student__c ';
        List<String> filters = new List<String>();

        // Kiểm tra StudentCode__c
        if (String.isNotBlank(searchStudentCode)) {
            studentCodeKey = '%' + String.escapeSingleQuotes(searchStudentCode) + '%';
            filters.add('StudentCode__c LIKE :studentCodeKey');
        }

        if (searchStudent.Name != null && !String.isEmpty(searchStudent.Name)) {
            String nameKey= '%' + String.escapeSingleQuotes(searchStudent.Name + '%');
            filters.add('(Name LIKE :nameKey OR FirstName__c LIKE :nameKey OR LastName__c LIKE :nameKey)');
        }

        // Kiểm tra Gender__c
        if (searchStudent.Gender__c != null && !String.isEmpty(searchStudent.Gender__c)) {
            filters.add('Gender__c = \'' + String.escapeSingleQuotes(searchStudent.Gender__c) + '\'');
        }

        // Kiểm tra Class_look__c
        // if (searchStudent.Class_look__c != null && !String.isEmpty(searchStudent.Class_look__c)) {
        //     filters.add('Class_look__c = \'' + String.escapeSingleQuotes(searchStudent.Class_look__c) + '\'');
        // }
        if (searchStudent.Class_look__c != null) {
            filters.add('Class_look__c = \'' + String.escapeSingleQuotes(searchStudent.Class_look__c) + '\'');
        }
        Date birthDate = searchStudent.Birthday__c;
        // Kiểm tra Birthday__c
        if (birthDate != null) {
            filters.add('Birthday__c = '+ String.valueOf(birthDate));
        }
        

        // Nối các điều kiện
        if (!filters.isEmpty()) {
            // query += ' WHERE ' + String.join(filters, ' AND ');
            String whereClause = ' WHERE ' + String.join(filters, ' AND ');
            countQuery += whereClause;
            query += whereClause;
        }
        query += ' ORDER BY StudentCode__c DESC';

            // Lấy tổng số bản ghi
        totalRecords = Database.countQuery(countQuery);

        // Tính tổng số trang
        totalPages = (Integer)Math.ceil((Decimal)totalRecords / pageSize);
        pageNumbers = new List<Integer>();
        
        Integer maxPagesToShow = 5;
        Integer startPage = Math.max(1, currentPage - 2); // Tính trang bắt đầu (2 trang trước trang hiện tại)
        Integer endPage = Math.min(totalPages, startPage + maxPagesToShow - 1); // Tính trang kết thúc
        // Nếu còn ít trang, điều chỉnh lại startPage và endPage sao cho không vượt quá tổng số trang
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - (maxPagesToShow - 1));
        }
        pageNumbers = new List<Integer>();
        for (Integer i = startPage; i <= endPage; i++) {
            pageNumbers.add(i);
        }
        // Lấy dữ liệu sinh viên với giới hạn
        Integer offset = (currentPage - 1) * pageSize;
        query += ' LIMIT ' + pageSize + ' OFFSET ' + offset;

        students = Database.query(query);
        System.debug(query);
    }

    // Phương thức reset tìm kiếm
    public void resetSearch() {
        searchStudent = new Student__c(); // Reset các trường tìm kiếm
        searchStudentCode=null;
        // searchStudents(); 
    }
    

    // Phương thức tạo sinh viên mới
    public PageReference createStudent() {
        PageReference pageRef = Page.VF_CreateStudent;
        pageRef.setRedirect(true);
        return pageRef;
    }


    // Các phương thức khác
    // public PageReference deleteStudentCheckbox() {
    //     return null;
    // }
    public PageReference viewStudent() {
        PageReference pageRef = Page.VF_DetailStudent; 
        pageRef.getParameters().put('studentId', selectedStudentId);
        pageRef.setRedirect(true);
        return pageRef;
    }
    public PageReference updateStudent() {
        PageReference pageRef = Page.VF_UpdateStudent; 
        pageRef.getParameters().put('studentId', selectedStudentId);
        pageRef.setRedirect(true);
        return pageRef;
    }
    @RemoteAction
    public static void setSelectedStudent(String ids){
        VF_SearchStudentCtrl ctrl = new VF_SearchStudentCtrl();
        ctrl.selectedStudentIds = ids;
        System.debug('Selected student Ids: ' + ids);
    }

    // Phương thức xóa sinh viên (1 hoặc nhiều)
    public PageReference deleteStudents() {
        try {
            List<Id> idsToDelete = new List<Id>();
    
            // Xử lý ID từ input ẩn (dành cho 1 hoặc nhiều ID)
            if (String.isNotBlank(selectedStudentIds)) {
                for (String idStr : selectedStudentIds.split(',')) {
                    idsToDelete.add(Id.valueOf(idStr.trim()));
                }
            }
    
            // Kiểm tra nếu danh sách không rỗng thì xóa
            if (!idsToDelete.isEmpty()) {
                delete [SELECT Id FROM Student__c WHERE Id IN :idsToDelete];
                System.debug('Students deleted: ' + idsToDelete);
    
                // Thêm thông báo thành công
                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.INFO, 'The selected students have been deleted.'));
            } else {
                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.WARNING, 'No students selected for deletion.'));
            }
    
            // Chuyển hướng về trang danh sách sinh viên
            PageReference pageRef = Page.VF_SearchStudent; 
            pageRef.setRedirect(true); 
            return pageRef; 
            
        } catch (Exception e) {
            // Xử lý lỗi
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Error while deleting students: ' + e.getMessage()));
            return null; // Ở lại trang hiện tại nếu có lỗi
        }
    }
    
    public void firstPage() {
        currentPage = 1;
        searchStudents();
    }
    
    public void prevPage() {
        if (currentPage > 1) {
            currentPage--;
            searchStudents();
        }
    }
    
    public void nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            searchStudents();
        }
    }
    
    public void lastPage() {
        currentPage = totalPages;
        searchStudents();
    }

    // public void goToPage(Integer page) {
    //     if (page >= 1 && page <= totalPages) {
    //         currentPage = page;
    //         searchStudents();
    //     }
    // }
    public void goToPage() {
        currentPage = Integer.valueOf(ApexPages.currentPage().getParameters().get('pageNumber'));
        searchStudents(); // Tải lại dữ liệu cho trang mới
    }
    
    public void Paging() {
        searchStudents();
    }


}
