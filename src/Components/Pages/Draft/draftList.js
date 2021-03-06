import React, { Component } from 'react';
import { Button, Modal, Breadcrumb } from "react-bootstrap";
import MUIDataTable from "mui-datatables";
import FloatingButton from '../../Material/FloatingButton';
import { connect } from "react-redux";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from 'react-bootstrap/Spinner';
import * as FileSaver from 'file-saver';
import XLSX from "xlsx";
import ReactTooltip from 'react-tooltip';
import * as moment from 'moment';
import Moment from 'react-moment';

toast.configure();
class draftList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      MyApplicationList: [], 
      deletePopup: false,
      deleteReferenceno: "",
      loading: "",
      downloadExcel: [], 
      downloadExcelArray: [], 
      isdownloadExcelFirstLoadDone: 0, 
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'headerTitle', value: "My Application : Draft List" })
    this.GetListData('Draft')
  }

  GetListData = (val) => {
    let postData = { UserId: this.props.UserId, Status: val }
    fetch(process.env.REACT_APP_WEB_SERVICE_URL + '/api/MyApplication/GetMyApplicationList', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.props.getToken,
    },
    body: JSON.stringify(postData)
    }).then(response=>{
      if(response.status === 200){
          return response.json()
      }else if(response.status === 401){
          this.props.dispatch({ type: 'Token', value: "" });
          this.props.dispatch({ type: 'profile', value: "" });
          this.props.dispatch({ type: 'userType', value: "" });
      }
    })
    .then(data => {
      console.log(data)
      if(data){
        this.setState({ MyApplicationList: data.MyApplicationList, loading: "Yes" })
      }
    })
  }

  viewRequest = (Referenceno) =>{
    var CryptoJS = require("crypto-js");
    window.location = process.env.REACT_APP_ENV +"/draft/view?p=" + encodeURI(CryptoJS.AES.encrypt(JSON.stringify(Referenceno), process.env.REACT_APP_ENCRYPT_PASSWORD).toString());
  }

  editRequest = (Referenceno) =>{
    var CryptoJS = require("crypto-js");
    window.location = process.env.REACT_APP_ENV +"/draft/edit?p=" + encodeURI(CryptoJS.AES.encrypt(JSON.stringify(Referenceno), process.env.REACT_APP_ENCRYPT_PASSWORD).toString());
  }

  deleteRequest = (Referenceno) =>{
    // alert(Referenceno)
    this.setState({ deletePopup: true, deleteReferenceno: Referenceno})
  }

  cancelDelete = () =>{
    this.setState({ deletePopup: false, deleteReferenceno: "" })
  }

  confirmDelete = () =>{
    // alert(this.state.deleteReferenceno)
    let postData = { 
      Referenceno: this.state.deleteReferenceno
    }
    fetch(process.env.REACT_APP_WEB_SERVICE_URL + '/api/GGP/DeleteGGPRequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.props.getToken,
    },
    body: JSON.stringify(postData)
    }).then(response=>{
      if(response.status === 200){
          return response.json()
      }else if(response.status === 401){
          this.props.dispatch({ type: 'Token', value: "" });
          this.props.dispatch({ type: 'profile', value: "" });
          this.props.dispatch({ type: 'userType', value: "" });
      }
    })
    .then(data => {
      //console.log(data)
      if(data){
        toast.success("Deleted successfully.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
        });
        this.setState({ deletePopup: false, deleteReferenceno: "" })
        this.GetListData('Draft')
      }
    })
    
  }

  downloadExcelFile = () =>{
    const Heading = [
      {
        header1: "GGP Reference No",
        header2: "Goods Type",
        header3: "Goods Category",
        header4: "Requester",
        header5: "Exit Time",
        header6: "Created Date",
        header7: "Approval Status",
      }
    ];
    (async () => {
      await this.setState({ downloadExcelArray: [] })
    })();
    if(this.state.downloadExcel.length > 0){
      (async () => {
        await this.state.downloadExcel.forEach((value,index) =>{
          let mdData = [
            value.data[0],
            value.data[1],
            value.data[2],
            value.data[3],
            value.data[4],
            value.data[5],
            value.data[6],
          ];
          this.state.downloadExcelArray.push(mdData)
          return null;
        })
      })();
    }else{
      (async () => {
        await this.state.MyApplicationList.forEach((value,index) =>{
          let mdData = [
            value.ggp_reference_no,
            value.goods_type,
            value.goods_category,
            value.requester,
            value.exit_time,
            value.submitted_date,
            value.approval_status,
          ];
          this.state.downloadExcelArray.push(mdData)
          return null;
        })
      })();
    }

    const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const filename = "draft.xlsx";
    
    const ws = XLSX.utils.json_to_sheet(Heading, {
      skipHeader: true,
      origin: 0
    });
    XLSX.utils.sheet_add_json(ws, this.state.downloadExcelArray, {
      skipHeader: true,
      origin: -1
    });
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, filename);
  }

  printRequest = (Referenceno) =>{
    var CryptoJS = require("crypto-js");
    window.location = process.env.REACT_APP_ENV +"/draft/print?p=" + encodeURI(CryptoJS.AES.encrypt(JSON.stringify(Referenceno), process.env.REACT_APP_ENCRYPT_PASSWORD).toString());
  }

  render() {
    
    let dataArray = [];
    this.state.MyApplicationList.map((data) => {
    
      let mdData = [
        data.ggp_reference_no,
        data.goods_type,
        data.goods_category,
        data.requester,
        data.exit_time,
        ((data.submitted_date) ? moment(data.submitted_date).format("DD-MM-yyyy HH:mm:ss") : ""),
        data.approval_status,
        data.ggp_reference_no,
        data.goods_type,
        data.goods_category,
        data.requester,
        data.exit_time,
        ((data.submitted_date) ? moment(data.submitted_date).format("DD-MM-yyyy") : ""),
        ((data.submitted_date) ? moment(data.submitted_date).format("DD-MM-yyyy HH:mm:ss") : ""),
        data.approval_status,
        data.ggp_reference_no,
      ];
      dataArray.push(mdData)
      return null;
    });

    const columns = [

      {
        name: "ggp_reference_no",
        label: "GGP Reference No",
        options: {
          filter: false,
          sort: false,
          display: false,
          viewColumns: false,
        },
       },
       {
        name: "goods_type",
        label: "Goods Type",
        options: {
          filter: false,
          sort: false,
          display: false,
          viewColumns: false,
        },
       },
       {
        name: "goods_category",
        label: "Goods Category",
        options: {
          filter: false,
          sort: false,
          display: false,
          viewColumns: false,
        },
       },
       {
        name: "requester",
        label: "Requester",
        options: {
          filter: false,
          sort: false,
          display: false,
          viewColumns: false,
        },
       },
       {
         name: "exit_time",
         label: "Exit Time",
         options: {
          filter: false,
          sort: false,
          display: false,
          viewColumns: false,
        },
        },
        {
         name: "submitted_date",
         label: "Created Date",
         options: {
          filter: false,
          sort: false,
          display: false,
          viewColumns: false,
        },
        },
        {
         name: "approval_status",
         label: "Approval Status",
         options: {
          filter: false,
          sort: false,
          display: false,
          viewColumns: false,
        },
      },

      {
       name: "ggp_reference_no",
       label: "GGP Reference No",
       options: {
        filter: true,
        filterType: "dropdown",
        sort: true,
       },
       editable: true
      },
      {
       name: "goods_type",
       label: "Goods Type",
       options: {
        filter: true,
        filterType: "dropdown",
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <>
              <div>{value}</div>
            </>
          );
        }
       }
      },
      {
       name: "goods_category",
       label: "Goods Category",
       options: {
        filter: true,
        filterType: "dropdown",
        sort: true,
       }
      },
      {
       name: "requester",
       label: "Requester",
       options: {
        filter: true,
        filterType: "dropdown",
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <>
              <div>{value}</div>
            </>
          );
        }
       }
      },
      {
        name: "exit_time",
        label: "Exit Time",
        options: {
         filter: true,
         filterType: "dropdown",
         sort: true,
        }
       },
       {
        name: "submitted_date",
        label: "Created Date",
        options: {
          filter: false,
          filterType: "dropdown",
          sort: false,
          display: false,
          viewColumns: false,
        }
       },
       {
        name: "submitted_date",
        label: "Created Date",
        options: {
         filter: true,
         filterType: "dropdown",
         sort: true,         
        }
       },
       {
        name: "approval_status",
        label: "Approval Status",
        options: {
         filter: true,
         filterType: "dropdown",
         sort: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="badge badge-draft">{value}</div>
            );
          }
        }
       },
       {
        name: "action",
        label: "Action",
        options: {
         filter: true,
         filterType: "dropdown",
         sort: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <>
              <ReactTooltip />
              <img className="action-right-space mouse-pointer" src={process.env.REACT_APP_ENV +"/assets/images/icons/action/awesome-eye.svg"} alt="View"  onClick={() => this.viewRequest(value)} data-tip="View"/>
              <img className="action-right-space mouse-pointer" style={{width: "25px"}} src={process.env.REACT_APP_ENV +"/assets/images/icons/action/edit-solid.svg"} data-tip="Edit" alt="Metro Flow Tree"  onClick={() => this.editRequest(value)} data-tip="Edit"/>
              <img className="action-right-space mouse-pointer" style={{width: "25px"}} src={process.env.REACT_APP_ENV +"/assets/images/icons/action/trash-2.svg"} alt="Close" onClick={() => this.deleteRequest(value)} data-tip="Delete"/>
              <img className="action-right-space mouse-pointer" src={process.env.REACT_APP_ENV +"/assets/images/icons/action/print-standard-pdf.svg"} alt="Standard Print" onClick={() => this.printRequest(value)} data-tip="Standard Print"/>
              </>
            );
          }
        }
       },
     ];
     
    const options = {
      filterType: 'checkbox',
      download: false,
      print: false,
      textLabels: {
        body: {
            noMatch: this.state.loading ? 'Sorry, there is no matching data to display' :
            <Spinner animation="border" variant="primary" style={{margin: "auto" }} />,
        },
      },
      onTableChange: (action, tableState) => {
        console.log("onTableChange");
        console.log(action);
        console.log(this.state.isdownloadExcelFirstLoadDone);
        if(this.state.isdownloadExcelFirstLoadDone === 0){  
          console.log(action);
          if(action === "propsUpdate"){
            console.log(tableState.displayData);
            this.setState({ downloadExcel: tableState.displayData, isdownloadExcelFirstLoadDone: 1})
          }
        }
        if(action === "search" || action === "sort"){
          (async () => {
            await this.setState({ downloadExcel: [] })
          })();
          this.setState({ downloadExcel: tableState.displayData})
        }
      },
      customToolbar: () => {
        return (
          <>
            <button className="MuiButtonBase-root MuiIconButton-root MUIDataTableToolbar-icon-23" tabindex="0" type="button" data-testid="Download CSV-iconButton" aria-label="Download CSV" onClick={this.downloadExcelFile}>
              <span className="MuiIconButton-label">
                <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"></path>
                </svg>
              </span>
              <span className="MuiTouchRipple-root"></span>
            </button>
          </>
        );
      }
    };
     
    return (
       <>
       
       
        <Breadcrumb>
          <Breadcrumb.Item href={process.env.REACT_APP_ENV +"/dashboard"}>Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item active>My Application : Draft List</Breadcrumb.Item>
        </Breadcrumb>
       <div className="col-xs-2"> <MUIDataTable 
          title={""}
          data={dataArray}
          columns={columns}
          options={options}
        /> </div>
        <p className="text-center"></p>
        <Modal show={this.state.deletePopup}>  
          <Modal.Header >Delete Confirmation</Modal.Header>  
          <Modal.Body>
            <div className="alert alert-danger" role="alert">
              Are you sure you want to delete?
            </div>
            <hr></hr>
            <div className="text-right">
              <Button className="btn btn-light"  onClick={this.cancelDelete}> No </Button> 
              <Button className="btn btn-primary-01 ml-3" onClick={this.confirmDelete}> Yes </Button>  
            </div>
          </Modal.Body>  
        </Modal>
        <FloatingButton />
     </>
    );
  }
}

const mapStateToProps = state => {
  return {
    menuVisibility: state.menuVisibility,
    menuStatusHeader: state.menuStatusHeader,
    headerTitle: state.headerTitle,
    getToken: state.token,
    userType: state.userType,
    userName: state.userName,
    UserId: state.UserId,
  };
}

export default connect(mapStateToProps)(draftList);
