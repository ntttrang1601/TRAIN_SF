//import { LightningElement } from 'lwc';
import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getStudents from '@salesforce/apex/LWC_SearchStudentCtrl.getStudents';
import getClassOptions from '@salesforce/apex/LWC_SearchStudentCtrl.getClassOptions';
import getGenderOptions from '@salesforce/apex/LWC_SearchStudentCtrl.getGenderOptions';
import searchStudents from '@salesforce/apex/LWC_SearchStudentCtrl.searchStudents';
import deleteStudent from '@salesforce/apex/LWC_SearchStudentCtrl.deleteStudent';
import deleteStudents from '@salesforce/apex/LWC_SearchStudentCtrl.deleteStudents';


export default class Lwc_SearchStudent extends LightningElement {
    // Data properties
    @track students = [];
    selectedIds = new Set(); // Lưu danh sách sinh viên đã chọn
    selectedAllPages = false;
    @track classOptions = [];
    @track genderOptions = [];
    //@track selectedIds = [];
    
    // Search filters
    @track studentCode = '';
    @track searchName = '';
    @track classCode = '';
    @track gender = '';
    @track birthDate;
    
    // Pagination
    @track pageSize = 10;
    @track pageNumber = 1;
    @track totalPages = 0;
    @track totalRecords = 0;
    @track pageNumbers = [];
    
    // UI states
    @track selectedAll = false;
    @track isClearDisabled = true;
    @track showCreateModal = false;
    @track showViewModal = false;
    @track showEditModal = false;
    @track showDeleteModal = false;
    @track selectedStudentId;
    @track deleteId;

    get isFirstPage() {
        return this.pageNumber === 1;
    }
    get isLastPage() {
        return this.pageNumber === this.totalPages;
    }
    get computedPageNumbers() {
        return this.pageNumbers.map(num => ({
            num,
            variant: num === this.pageNumber ? 'brand' : 'neutral'
        }));
    }
    get isDeleteDisabled() {
        return this.selectedIds.size === 0;
    }

    // Lifecycle hooks
    connectedCallback() {
        this.loadInitialData();
    }

    // Wire methods
    @wire(getClassOptions)
    wiredClassOptions({ error, data }) {
        if (data) {
            this.classOptions = data;
        } else if (error) {
            this.showToast('Error', 'Error loading class options', 'error');
        }
    }

    @wire(getGenderOptions)
    wiredGenderOptions({ error, data }) {
        if (data) {
            this.genderOptions = data;
        } else if (error) {
            this.showToast('Error', 'Error loading gender options', 'error');
        }
    }

    // Methods
    async loadInitialData() {
        try {
            this.search();
        } catch (error) {
            this.showToast('Error', 'Error loading initial data', 'error');
        }
    }

    // async search() {
    //     try {
    //         const result = await searchStudents({
    //             studentCode: this.studentCode,
    //             searchName: this.searchName,
    //             classCode: this.classCode,
    //             gender: this.gender,
    //             birthDate: this.birthDate,
    //             pageSize: this.pageSize,
    //             pageNumber: this.pageNumber
    //         });

    //         if (result) {
    //             this.students = result.students.map(student => ({
    //                 ...student,
    //                 selected: this.selectedIds.includes(student.Id)
    //             }));
    //             this.totalRecords = result.totalRecords;
    //             this.totalPages = result.totalPages;
    //             this.calculatePageNumbers();
    //             this.selectedAll = this.students.every(student => student.selected);
    //         }
    //     } catch (error) {
    //         this.showToast('Error', 'Error searching students', 'error');
    //     }
    // }
    async search() {
        try {
            const result = await searchStudents({
                studentCode: this.studentCode,
                searchName: this.searchName,
                classCode: this.classCode,
                gender: this.gender,
                birthDate: this.birthDate,
                pageSize: this.pageSize,
                pageNumber: this.pageNumber
            });
    
            if (result) {
                this.students = result.students.map(student => ({
                    ...student,
                    selected: this.selectedIds.has(student.Id) // Giữ trạng thái đã chọn
                }));
                this.totalRecords = result.totalRecords;
                this.totalPages = result.totalPages;
                this.calculatePageNumbers();
                this.selectedAll = this.students.every(student => this.selectedIds.has(student.Id));
            }
        } catch (error) {
            this.showToast('Error', 'Error searching students', 'error');
        }
    }
    

    calculatePageNumbers() {
        const maxPagesToShow = 5;
        
        // Tính toán khoảng hiển thị số trang
        let startPage = Math.max(1, this.pageNumber - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;
    
        // Điều chỉnh nếu endPage vượt quá totalPages
        if (endPage > this.totalPages) {
            endPage = this.totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
    
        this.pageNumbers = Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
        );
    }
    

    // Event handlers
    handleSearch() {
        this.pageNumber = 1;
        this.search();
    }

    handleClear() {
        this.studentCode = '';
        this.searchName = '';
        this.classCode = '';
        this.gender = '';
        this.birthDate = null;
        this.isClearDisabled = true;
    }

    handleCreate() {
        this.showCreateModal = true;
    }

    handleView(event) {
        this.selectedStudentId = event.target.value;
        this.showViewModal = true;
    }

    handleEdit(event) {
        this.selectedStudentId = event.target.value;
        this.showEditModal = true;
    }

    handleDelete(event) {
        this.deleteId = event.target.value;
        this.showDeleteModal = true;
    }

    async confirmDelete() {
        try {
            if (this.deleteId) {
                await deleteStudent({ studentId: this.deleteId });
                this.showToast('Success', 'Student deleted successfully', 'success');
            } else if (this.selectedIds.length > 0) {
                await deleteStudents({ studentIds: this.selectedIds });
                this.showToast('Success', 'Selected students deleted successfully', 'success');
                this.selectedIds = [];
                this.selectedAll = false;
            }
            this.showDeleteModal = false;
            this.deleteId = null;
            this.search();
        } catch (error) {
            this.showToast('Error', 'Error deleting students', 'error');
        }
    }

    // handleSelectAll(event) {
    //     this.selectedAll = event.target.checked;
    //     this.students = this.students.map(student => ({
    //         ...student,
    //         selected: this.selectedAll
    //     }));
    //     this.selectedIds = this.selectedAll ? this.students.map(student => student.Id) : [];
    // }
    handleSelectAll(event) {
        this.selectedAll = event.target.checked;
        
        if (this.selectedAll) {
            // Lưu tất cả ID của sinh viên trên trang hiện tại vào Set
            this.students.forEach(student => this.selectedIds.add(student.Id));
        } else {
            // Xóa ID của sinh viên trên trang hiện tại khỏi Set
            this.students.forEach(student => this.selectedIds.delete(student.Id));
        }
        
        // Cập nhật trạng thái checkbox của danh sách sinh viên
        this.students = this.students.map(student => ({
            ...student,
            selected: this.selectedIds.has(student.Id)
        }));
    }
    

    // handleCheckboxChange(event) {
    //     const studentId = event.target.value;
    //     const isSelected = event.target.checked;
        
    //     if (isSelected) {
    //         this.selectedIds = [...this.selectedIds, studentId];
    //     } else {
    //         this.selectedIds = this.selectedIds.filter(id => id !== studentId);
    //     }
        
    //     this.students = this.students.map(student => ({
    //         ...student,
    //         selected: student.Id === studentId ? isSelected : student.selected
    //     }));
        
    //     this.selectedAll = this.students.every(student => student.selected);
    // }

    handleCheckboxChange(event) {
        const studentId = event.target.value;
        const isSelected = event.target.checked;
    
        if (isSelected) {
            this.selectedIds.add(studentId);
        } else {
            this.selectedIds.delete(studentId);
        }
    
        this.students = this.students.map(student => ({
            ...student,
            selected: this.selectedIds.has(student.Id)
        }));
    
        this.selectedAll = this.students.every(student => this.selectedIds.has(student.Id));
    }
    

    // Pagination handlers
    handleFirst() {
        this.pageNumber = 1;
        this.search();
    }

    handlePrevious() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.search();
        }
    }

    handleNext() {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.search();
        }
    }

    handleLast() {
        this.pageNumber = this.totalPages;
        this.search();
    }

    handlePageChange(event) {
        this.pageNumber = parseInt(event.target.value, 10);
        this.search();
    }

    // Utility methods
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    // Modal handlers
    handleModalClose() {
        this.showCreateModal = false;
        this.showViewModal = false;
        this.showEditModal = false;
        this.showDeleteModal = false;
        this.selectedStudentId = null;
        this.deleteId = null;
    }

    handleRefresh() {
        this.search();
    }
}