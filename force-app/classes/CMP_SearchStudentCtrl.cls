public with sharing class CMP_SearchStudentCtrl {
    // Add Custom Setting property
    private StudentManageSetting__c studentManageSetting;

    // Properties for pagination
    public Integer pageSize { get; set; }
    public Integer maxRecords { get; set; }
    @AuraEnabled(cacheable=true)
    public static List<Student__c> getStudents() {
        return [SELECT Id, StudentCode__c, Lastname__c, Firstname__c, Birthday__c, Gender__c, 
                Class_look__r.Name, Class_look__c, LearningStatus__c FROM Student__c];
    }
    @AuraEnabled
    public static List<Map<String,String>> getClassOptions() {
        List<Map<String,String>> options = new List<Map<String,String>>();
        options.add(new Map<String,String>{'label' => '--なし--', 'value' => ''});
        
        for(Class__c cls : [SELECT Id, Name FROM Class__c ORDER BY Name]) {
            options.add(new Map<String,String>{
                'label' => cls.Name,
                'value' => cls.Id
            });
        }
        return options;
    }
    @AuraEnabled
    public static List<Map<String,String>> getGenderOptions() {
        List<Map<String, String>> genderOptions = new List<Map<String, String>>();
        genderOptions.add(
            new Map<String, String>{ 'label' => '--なし--', 'value' => '' }
        );
        Schema.DescribeFieldResult genderField = Student__c.Gender__c.getDescribe();
        for (Schema.PicklistEntry entry : genderField.getPicklistValues()) {
            genderOptions.add(
            new Map<String, String>{
                'label' => entry.getLabel(),
                'value' => entry.getValue()
            }
            );
        }
        return genderOptions;
    }
    public CMP_SearchStudentCtrl() {
        // Get Custom Setting
        studentManageSetting = StudentManageSetting__c.getOrgDefaults();

        // Initialize pagination with Custom Setting values
        pageSize = Integer.valueOf(studentManageSetting.S_RecordPerPage__c) > 0 
                ? Integer.valueOf(studentManageSetting.S_RecordPerPage__c) 
                : 6; // Default value if not set
        maxRecords = Integer.valueOf(studentManageSetting.S_MaxRecord__c) > 0 
                    ? Integer.valueOf(studentManageSetting.S_MaxRecord__c) 
                    : 10000; // Default value if not set
    }
    @AuraEnabled
    public static SearchResult searchStudents(String studentCode, String searchName, 
                                            String classCode, String gender, Date birthDate,
                                            Integer pageSize, Integer pageNumber) {
        try {
            // Get Custom Setting
            StudentManageSetting__c setting = StudentManageSetting__c.getOrgDefaults();
            if (setting == null) {
                throw new AuraHandledException('Student Manage Setting is not configured');
            }
            
            Integer maxRecords = setting.S_MaxRecord__c != null ? 
                            Integer.valueOf(setting.S_MaxRecord__c) : 10000;
            
            // Debug logs
            System.debug('Input parameters: ');
            System.debug('studentCode: ' + studentCode);
            System.debug('searchName: ' + searchName);
            System.debug('classCode: ' + classCode);
            System.debug('gender: ' + gender);
            System.debug('birthDate: ' + birthDate);
            System.debug('pageSize: ' + pageSize);
            System.debug('pageNumber: ' + pageNumber);
            
            // Build query
            String query = 'SELECT Id, StudentCode__c, Lastname__c, Firstname__c, ' +
                        'Birthday__c, Gender__c, Class_look__c, Class_look__r.Name ' +
                        'FROM Student__c WHERE Id != null';
            
            // Add filters
            if (String.isNotBlank(studentCode)) {
                query += ' AND StudentCode__c LIKE \'%' + String.escapeSingleQuotes(studentCode) + '%\'';
            }
            if (String.isNotBlank(searchName)) {
                String searchTerm = '%' + String.escapeSingleQuotes(searchName) + '%';
                query += ' AND (Lastname__c LIKE :searchTerm OR Firstname__c LIKE :searchTerm)';
            }
            if (String.isNotBlank(classCode)) {
                query += ' AND Class_look__c = :classCode';
            }
            if (String.isNotBlank(gender)) {
                query += ' AND Gender__c = :gender';
            }
            if (birthDate != null) {
                query += ' AND Birthday__c = :birthDate';
            }
            
            System.debug('Final query: ' + query);
            
            // Count total records
            String countQuery = query.replaceFirst('SELECT.*?FROM', 'SELECT COUNT() FROM');
            Integer totalRecords = Math.min(Database.countQuery(countQuery), maxRecords);
            
            // Calculate pagination
            Integer totalPages = Math.ceil(Decimal.valueOf(totalRecords) / pageSize).intValue();
            Integer offset = (pageNumber - 1) * pageSize;
            
            // Limit the query
            query += ' ORDER BY StudentCode__c DESC LIMIT :pageSize OFFSET :offset';
            
            // Execute query
            List<Student__c> students = Database.query(query);
            
            System.debug('Query results count: ' + students.size());
            
            // Return result
            return new SearchResult(students, totalRecords, totalPages);
            
        } catch (Exception e) {
            System.debug('Error in searchStudents: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            throw new AuraHandledException('Search error: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteStudents(List<String> studentIds) {
        try {
            // Kiểm tra quyền truy cập
            if (!Schema.sObjectType.Student__c.isDeletable()) {
                throw new AuraHandledException('Insufficient permissions to delete students');
            }

            List<Student__c> studentsToDelete = [SELECT Id FROM Student__c WHERE Id IN :studentIds];
            if (!studentsToDelete.isEmpty()) {
                delete studentsToDelete;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting students: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteStudent(String studentId) {
        try {
            // Kiểm tra quyền truy cập
            if (!Schema.sObjectType.Student__c.isDeletable()) {
                throw new AuraHandledException('Insufficient permissions to delete student');
            }

            Student__c studentToDelete = [SELECT Id FROM Student__c WHERE Id = :studentId LIMIT 1];
            if (studentToDelete != null) {
                delete studentToDelete;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting student: ' + e.getMessage());
        }
    }

    // Wrapper class for search results
    public class SearchResult {
        @AuraEnabled public List<Student__c> students { get; set; }
        @AuraEnabled public Integer totalRecords { get; set; }
        @AuraEnabled public Integer totalPages { get; set; }
        
        public SearchResult(List<Student__c> students, Integer totalRecords, Integer totalPages) {
            this.students = students;
            this.totalRecords = totalRecords;
            this.totalPages = totalPages;
        }
    }
}