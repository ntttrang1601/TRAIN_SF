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
        return this.pageNumber === this.totalPages || this.students.length === 0;;
    }
    get computedPageNumbers() {
        return this.pageNumbers.map(num => ({
            num,
            variant: num === this.pageNumber ? 'brand' : 'neutral',
            disabled: num === this.pageNumber
        }));
    }

    
    get isDeleteDisabled() {
        return this.selectedIds.size === 0;
    }

    handleSearchInputChange(event) {
        const fieldName = event.target.label; // Lấy label của input để xác định trường cần cập nhật
        const value = event.target.value;
    
        switch (fieldName) {
            case "学生コード":
                this.studentCode = value;
                break;
            case "氏名":
                this.searchName = value;
                break;
            case "クラス":
                this.classCode = value;
                break;
            case "性別":
                this.gender = value;
                break;
            case "生年月日":
                this.birthDate = value;
                break;
            default:
                break;
        }
    
        // Kích hoạt nút "クリア" khi có dữ liệu nhập vào
        // this.isClearDisabled = !(
        //     this.studentCode || this.searchName || this.classCode || this.gender || this.birthDate
        // );
        this.isClearDisabled = !(this.studentCode || this.searchName || this.classCode || this.gender || this.birthDate || this.selectedIds.size > 0);
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
        this.selectedIds.clear(); 
        this.selectedAll = false; 
        this.pageNumber = 1;
        this.search();
    }

    // handleClear() {
    //     this.studentCode = '';
    //     this.searchName = '';
    //     this.classCode = '';
    //     this.gender = '';
    //     this.birthDate = null;
    //     this.isClearDisabled = true;
    // }

    handleClear() {
        // Xóa các trường tìm kiếm
        this.studentCode = '';
        this.searchName = '';
        this.classCode = '';
        this.gender = '';
        this.birthDate = null;
    
        // Xóa checkbox đã chọn
        this.selectedIds.clear();
        this.selectedAll = false;
        
        // Reset danh sách students để bỏ chọn checkbox
        this.students = this.students.map(student => ({
            ...student,
            selected: false
        }));
    
        // Vô hiệu hóa nút "クリア"
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

    handleDeleteSelected() {
        if (this.selectedIds && this.selectedIds.size > 0) {
            this.showDeleteModal = true;
        } else {
            this.showToast('Warning', 'Please select the students you want to delete.', 'warning');
        }
    }

    // async confirmDelete() {
    //     try {
    //         if (this.deleteId) {
    //             await deleteStudent({ studentId: this.deleteId });
    //             this.showToast('Success', 'Student deleted successfully', 'success');
    //         } else if (this.selectedIds.size > 0) {
    //             await deleteStudents({ studentIds: Array.from(this.selectedIds) });
    //             //await deleteStudents({ studentIds: this.selectedIds });
    //             console.log('Selected student IDs:', Array.from(this.selectedIds));
    //             this.showToast('Success', 'Selected students deleted successfully', 'success');
    //             this.selectedIds = [];
    //             this.selectedAll = false;
    //         }
    //         this.showDeleteModal = false;
    //         this.deleteId = null;
    //         this.search();
    //     } catch (error) {
    //         this.showToast('Error', 'Error deleting students', 'error');
    //     }
    // }
    async confirmDelete() {
        try {
            console.log('Current selected IDs before delete:', [...this.selectedIds]); 
            if (this.deleteId) {
                await deleteStudent({ studentId: this.deleteId });
                console.log('Deleted student ID:', this.deleteId); // Debug ID xóa
                this.showToast('Success', 'Student deleted successfully', 'success');
            } else if (this.selectedIds.size > 0) {
                console.log('Deleting multiple students:', [...this.selectedIds]);
                await deleteStudents({ studentIds: Array.from(this.selectedIds) });
                this.showToast('Success', 'Selected students deleted successfully', 'success');
                this.selectedIds.clear();
                this.selectedAll = false;
            }
    
            this.showDeleteModal = false;
            this.deleteId = null;
    
            await this.search(); // Load lại danh sách sinh viên
        } catch (error) {
            console.error('Error deleting students:', error); // Debug lỗi
            this.showToast('Error', 'Error deleting students', 'error');
        }
    }
    

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.deleteId = null;
    }

    
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
        // Kích hoạt nút "クリア" nếu có ít nhất một checkbox được chọn hoặc có dữ liệu nhập
        this.isClearDisabled = !(this.selectedIds.size > 0 || this.studentCode || this.searchName || this.classCode || this.gender || this.birthDate);
    }

    
    handleChildEvent(event) {
        if (event.detail.action === 'closeModal') {
            this.showCreateModal = false;
            this.showViewModal = false;
            this.showEditModal = false;
        }
    }
    handleCheckboxChange(event) {
        const studentId = event.target.value;
        const isSelected = event.target.checked;
    
        if (isSelected) {
            this.selectedIds.add(studentId);
        } else {
            this.selectedIds.delete(studentId);
        }
    
        // Cập nhật trạng thái checkbox
        this.students = this.students.map(student => ({
            ...student,
            selected: this.selectedIds.has(student.Id)
        }));
    
        // Kiểm tra nếu tất cả checkbox trên trang đều được chọn
        this.selectedAll = this.students.every(student => this.selectedIds.has(student.Id));
    
        // Hiển thị nút "クリア" nếu có ít nhất một checkbox được chọn hoặc có dữ liệu nhập
        this.isClearDisabled = !(this.selectedIds.size > 0 || this.studentCode || this.searchName || this.classCode || this.gender || this.birthDate);
    }
    

    // handleCheckboxChange(event) {
    //     const studentId = event.target.value;
    //     const isSelected = event.target.checked;
    
    //     if (isSelected) {
    //         this.selectedIds.add(studentId);
    //     } else {
    //         this.selectedIds.delete(studentId);
    //     }
    
    //     console.log('Updated selected IDs:', [...this.selectedIds]);
    
    //     this.students = this.students.map(student => ({
    //         ...student,
    //         selected: this.selectedIds.has(student.Id)
    //     }));
    
    //     this.selectedAll = this.students.every(student => this.selectedIds.has(student.Id));
    // }
    


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

    handleRefresh(event) {
        if (event.detail === 'refresh') {
            this.showCreateModal = false; // Đóng modal
            this.showEditModal = false;
            this.search(); // Load lại danh sách sinh viên
        }
    }
    
    
}