import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Typography,
  IconButton,
  Collapse,
  Box,
} from "@mui/material";
import { Button } from "@mui/material";
import axios from "axios";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import styles from "./Appointment.module.css";
import MapViewContainer from './MapViewContainer';// Import the new component

const Row = ({ row, ownIds, onViewButtonClick }) => {
  const [open, setOpen] = useState(false);

  if (!row.appointment.map_object) {
    return null;
  }
  return (
    <React.Fragment>
      <TableRow
        key={`outer-${row.appointment.map_object.id}-${row.appointment.id}`}
        className={styles.tableRow}
        sx={{ "& > *": { borderBottom: "unset" } }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.ownId}</TableCell>
        <TableCell>{row.user.firstName}</TableCell>
        <TableCell>{row.user.lastName}</TableCell>
        <TableCell>{row.appointment.date_from}</TableCell>
        <TableCell>{row.appointment.date_to}</TableCell>
        <TableCell>{row.user.construction_type}</TableCell>
        <TableCell>{row.user.email}</TableCell>
        <TableCell>
          <Button 
            variant="contained" 
            color="success"
            size="small"
            onClick={() => onViewButtonClick(row)}
          >
            view
          </Button>
        </TableCell>
        
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Additional info...
              </Typography>
              <Table size="small" aria-label="details">
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Area</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={row.appointment.map_object}>
                    <TableCell>{objectToString(row.map_object.address)}</TableCell>
                    <TableCell>{row.user.phone_number}</TableCell> 
                  {/*  <TableCell>{'Total cost' , getTotalCost(row.shapes)}</TableCell>
                    <TableCell>{'Total area' , getTotalArea(row.shapes)}</TableCell>*/}
                  </TableRow>
                  {row.shapes.map((shape) => (
                    <TableRow key={shape.id_shape}>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>{shape.cost}</TableCell>
                      <TableCell>{shape.area}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const getTotalCost = (shapes) => {
  return shapes.reduce((totalCost, shape) => totalCost + shape.cost, 0);
};

const getTotalArea = (shapes) => {
  return shapes.reduce((totalArea, shape) => totalArea + shape.area, 0);
};

// const objectToString = (obj) => {
//   let str = ''
//   if (obj) {
//     const keys = Object.keys(obj)
//     for (const key of keys) {
//       if (key !== 'id')
//         str += `${obj[key]} `;
//     }
//   }
//   return str
// }

const objectToString = (obj) => {
  let str = '';
  if (obj) {
    const keys = Object.keys(obj);
    for (const key of keys) {
      if (key !== 'id' && key !== 'formatted_address') {
        str += `${obj[key]} `;
      }
    }
  }
  return str.trim();
};

const Appointment = () => {
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [ownIds, setOwnIds] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [addressDetail, setAddressDetail] = useState();

  const handleViewButtonClick = (row) => {
    const uniqueIdentifier = row.map_object.unique_identifier;
    setSelectedRow(row);
  
    axios.get(`${process.env.REACT_APP_BASE_URL}/shapes/api/data/?unique_identifier=${uniqueIdentifier}`)
      .then(response => {
        const mapObjectData = response.data;
        console.log('mapObjectData' , mapObjectData);
        
        if (mapObjectData.shapes && mapObjectData.shapes.length > 0) {
          setAddressDetail(objectToString(response.data.address[0]));
          const locationArray = mapObjectData.map_object.location;
          const coordinatesArray = mapObjectData.shapes.map(shape => shape.coordinates);
          const updatedRow = { ...row, lat: locationArray[1], lng: locationArray[0] , coordinatesArray };
          setSelectedRow(updatedRow);
          setIsPopupOpen(true);
        } else {
          console.error("Shapes data is missing or empty.");
        }
      })
      .catch(error => {
        console.error("Error fetching shapes data:", error);
      });
  };

  const fetchAppointmentData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/appointment/appointment-details/`
      );
      if (response.status === 200) {
        const dataFromResponse = response.data;
        const data = dataFromResponse.map((item , index) => ({
          appointment: {
            map_object: item.map_object,
            date_from: item.appointment.date_from,
            date_to: item.appointment.date_to,
            email: item.email,
          },
          user: {
            firstName: item.user.firstName,
            lastName: item.user.lastName,
            construction_type: item.user.construction_type,
            email: item.user.email,
            phone_number: item.user.phone,
          },
          map_object: {
            id: item.map_object.id,
            unique_identifier: item.map_object.unique_identifier,
            location: item.map_object.location,
            address: item.address,
          },
          shapes: item.shape || [],
          ownId: `${index + 1}`,
        }));
  
        const ownIdsMap = {};
        data.forEach((item) => {
        ownIdsMap[item.map_object.unique_identifier] = item.ownId;
      });
  
        setOwnIds(ownIdsMap);
        setTableData(data);
      } else {
        console.error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching appointment data:", error);
    }
  };

  useEffect(() => {
    fetchAppointmentData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedRow(null);
  };
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.content}>
          <Typography variant="h5" gutterBottom>
            Appointment Table
          </Typography>
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow className={styles.tableHeader}>
                  <TableCell/>
                  <TableCell>ID</TableCell>
                  <TableCell>F.Name</TableCell>
                  <TableCell>L.Name</TableCell>
                  <TableCell>Date From</TableCell>
                  <TableCell>Date To</TableCell>
                  <TableCell>Construction</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <Row
                      key={row.appointment.map_object || "defaultKey"}
                      row={row}
                      ownIds={ownIds}
                      onViewButtonClick={handleViewButtonClick}
                    />
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={tableData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </div>
      </div>
      {isPopupOpen && selectedRow && (
        <MapViewContainer
          selectedRow={selectedRow}
          latitude={selectedRow.lat}
          longitude={selectedRow.lng}
          zoom={17}
          center={selectedRow.center}
          coordinatesArray = {selectedRow.coordinatesArray}
          onClose={handleClosePopup}
        />

      )}
    </div>
  );
};

export default Appointment;

