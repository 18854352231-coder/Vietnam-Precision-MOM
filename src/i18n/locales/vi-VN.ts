import { viTask5Literal } from './task5Literals'
import { viTask6QualityLiteral } from './task6QualityLiterals'
import { viTask7ReportSystemLiteral } from './task7ReportSystemLiterals'
import { viTask8Literal } from './task8CastingLiterals'

export default {
  common: {
    appName: 'He thong MOM Viet Nam',
    actions: {
      search: 'Tim kiem',
      reset: 'Dat lai',
      confirm: 'Xac nhan',
      cancel: 'Huy'
    }
  },
  layout: {
    home: 'Trang chu',
    language: 'Ngon ngu',
    user: {
      admin: 'Quan tri vien',
      profile: 'Thong tin ca nhan',
      logout: 'Dang xuat'
    }
  },
  routes: {
    plan: {
      masterPlan: 'Ke hoach tong'
    },
    process: {
      root: 'Quan ly quy trinh',
      material: 'Du lieu vat lieu',
      processFiles: 'Tai lieu quy trinh'
    },
    casting: {
      root: 'San xuat duc',
      scheduling: 'Lap lich',
      meltingWorkbench: 'Ban van hanh nau chay',
      castingWorkbench: 'Ban van hanh duc',
      homogenizingWorkbench: 'Ban van hanh dong deu',
      sawingWorkbench: 'Ban van hanh cua'
    },
    extrusion: {
      root: 'San xuat ep de',
      scheduling: 'Lap lich',
      extrusionWorkbench: 'Ban van hanh ep de',
      sawingWorkbench: 'Ban van hanh cua',
      agingWorkbench: 'Ban van hanh hoa gia',
      cuttingWorkbench: 'Ban van hanh cat',
      packagingWorkbench: 'Ban van hanh dong goi',
      pendingStorage: 'Danh sach cho nhap kho',
      traceability: 'Truy xuat toan bo quy trinh',
      defectiveControl: 'Kiem soat hang loi'
    },
    mold: {
      root: 'Quan ly khuon',
      list: 'Danh sach khuon',
      dashboard: 'Bang dieu khien su dung'
    },
    quality: {
      root: 'Quan ly chat luong',
      ipqc: {
        root: 'IPQC',
        workbench: 'Ban lam viec IPQC',
        tasks: 'Nhiem vu kiem tra',
        records: 'Ho so kiem tra',
        exceptions: 'Bat thuong chat luong',
        plans: 'Phuong an kiem tra',
        spc: 'Phan tich xu huong SPC',
        processInspection: 'Kiem tra quy trinh',
        extrusion: 'IPQC ep de',
        aging: 'IPQC hoa gia',
        cuttingFeed: 'IPQC nap lieu cat',
        cutting: 'IPQC cat',
        prePackaging: 'IPQC truoc dong goi',
        leaderReview: 'To truong duyet',
        processQualityInspection: 'Kiem tra cong doan',
        inspectionConfig: 'Cau hinh kiem tra san pham'
      },
      sampleTesting: {
        root: 'Kiem tra mau',
        cncSample: 'Tao mau & nhan mau CNC',
        labTesting: 'Phong thi nghiem'
      }
    },
    equipment: {
      root: 'Quan ly thiet bi',
      tooling: 'Quan ly do gá',
      frame: 'Quan ly khung vat lieu',
      measuring: 'Quản lý thiết bị giám sát & đo lường',
      measuringSub: {
        ledger: 'Quản lý sổ cái',
        project: 'Quản lý dự án hiệu chuẩn',
        template: 'Quản lý mẫu hiệu chuẩn',
        task: 'Quản lý nhiệm vụ hiệu chuẩn',
        reminder: 'Quản lý nhắc nhở hiệu chuẩn'
      }
    },
    reports: {
      root: 'Phan tich bao cao',
      extrusion: {
        root: 'Bao cao ep de',
        production: 'San xuat ep de',
        cutting: 'San xuat cat'
      },
      casting: 'Bao cao duc'
    },
    settings: {
      root: 'Cai dat he thong',
      basic: {
        root: 'Thong tin co ban',
        department: 'Thong tin bo phan',
        user: 'Thong tin nguoi dung',
        position: 'Thong tin vi tri',
        team: 'Thong tin to nhom'
      },
      permission: {
        root: 'Cau hinh quyen',
        role: 'Quan ly vai tro',
        operation: 'Quyen thao tac',
        management: 'Quyen quan ly'
      },
      logs: {
        root: 'Nhat ky thao tac',
        normal: 'Nhat ky binh thuong',
        exception: 'Nhat ky bat thuong',
        interface: 'Nhat ky giao dien'
      },
      codeRules: 'Cau hinh quy tac ma'
    }
  },
  pages: {
    processInspection: {
      messages: {
        invalidProductOrRules: 'Vui long dam bao da nhap dung ten san pham va tai quy tac kiem tra (vi du: Thanh nhom tuy chinh mau A).',
        saveSuccess: 'Da luu phieu kiem tra thanh cong',
        recordMissing: 'Ban ghi khong ton tai hoac da duoc cap nhat',
        leaderReviewUnavailable: 'Ban ghi hien tai khong the duoc to truong duyet',
        missingInspectionItems: 'Thieu du lieu hang muc kiem tra',
        leaderReviewSuccess: 'To truong duyet thanh cong'
      }
    },
    inspectionConfig: {
      messages: {
        importSuccess: 'Da nhap tep quy tac kiem tra thanh cong: {fileName}',
        requiredProductInfo: 'Vui long nhap ma san pham va ten san pham',
        requiredRules: 'Vui long them it nhat mot quy tac kiem tra cho {process}',
        updateSuccess: 'Da cap nhat quy tac kiem tra cho [{productNo}] {process}',
        createSuccess: 'Da tao quy tac kiem tra cho [{productNo}] {process}',
        clearSuccess: 'Da xoa thanh cong'
      },
      confirm: {
        clearRules: 'Ban co chac muon xoa quy tac kiem tra cua san pham {productNo} trong [{process}] khong?',
        title: 'Thong bao'
      }
    },
    cncSample: {
      messages: {
        returnBlocked: 'Mot phan hoac toan bo hang muc cua mau nay da duoc gia cong hoac giao mau, khong the tra mau',
        returnSuccess: 'Tra mau thanh cong va da chuyen ve danh sach cho nhan mau',
        machiningFinishSuccess: 'Dang ky hoan thanh gia cong thanh cong',
        deliverySuccess: 'Giao mau thanh cong va da chuyen sang phong thi nghiem cho nhan mau',
        validPreparationItemRequired: 'Vui long them it nhat mot hang muc gia cong hop le',
        receiveSuccess: 'Dang ky nhan mau thanh cong va da tao danh sach gia cong',
        printSuccess: 'Da gui lenh in'
      }
    },
    labTesting: {
      messages: {
        machineExists: 'Ten may da ton tai',
        addMachineSuccess: 'Them thanh cong',
        deleteMachineSuccess: 'Xoa thanh cong',
        registerSuccess: 'Dang ky thanh cong',
        sampleNotFound: 'Khong tim thay mau cho dang ky',
        returnSuccess: 'Tra mau thanh cong',
        receiveSuccess: 'Nhan mau thanh cong'
      }
    },
    processFiles: {
      messages: {
        previewingFile: 'Dang xem truoc tep: {fileName}',
        agingProgramRequired: 'Vui long nhap che do hoa gia',
        saveSuccess: 'Thao tac thanh cong',
        deleteConfirm: 'Ban co chac muon xoa tep [{fileName}] khong?',
        deleteSuccess: 'Xoa thanh cong'
      }
    },
    masterPlan: {
      messages: {
        saveSuccess: 'Luu ke hoach tong thanh cong',
        deleteConfirm: 'Ban co chac muon xoa don hang {orderNo} khong?',
        deleteSuccess: 'Xoa thanh cong',
        exportInProgress: 'Dang xuat du lieu ke hoach tong...',
        importSuccess: 'Nhap tep thanh cong: {fileName}'
      },
      validation: {
        orderNoRequired: 'Vui long nhap so don hang',
        leaderRequired: 'Vui long nhap nguoi phu trach',
        productNameRequired: 'Vui long nhap ten hang'
      }
    }
  },
  literal: {
    ...viTask5Literal,
    ...viTask6QualityLiteral,
    ...viTask7ReportSystemLiteral,
    ...viTask8Literal
  },
  status: {
    completed: 'Hoan thanh',
    pending: 'Chua hoan thanh',
    pendingLeaderReview: 'Cho truong nhom duyet',
    idle: 'Dang ranh',
    heating: 'Dang tang nhiet',
    holding: 'Dang giu nhiet',
    pass: 'Dat',
    fail: 'Khong dat'
  }
}
