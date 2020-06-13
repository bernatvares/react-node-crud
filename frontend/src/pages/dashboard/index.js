import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash-es";
import Blob from "blob";
import download from "downloadjs";
import {
  Card,
  Elevation,
  ButtonGroup,
  Classes,
  Intent,
  Button,
  Tooltip,
} from "@blueprintjs/core";
import {
  Table,
  Column,
  Cell,
  RenderMode,
  SelectionModes,
} from "@blueprintjs/table";
import { DateRangeInput } from "@blueprintjs/datetime";
import moment from "moment";
import Header from "components/header";
import Pagination from "components/pagination";
import { AddRow, EditRow, DeleteRow } from "components/record";
import { getUsers } from "store/actions/user";
import MultiSelectUser from "components/multi_select_user";
import { setParams, getRecords, generateRecords } from "store/actions/record";
import withToast from "hoc/withToast";
import { DATE_FORMAT, ROLES } from "constants/index";

const Dashboard = (props) => {
  const {
    setParams,
    params,
    getRecords,
    records,
    count,
    me,
    userParams,
    getUsers,
    users,
    userCount,
    media,
  } = props;
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [filterByName, setFilterByName] = useState("");

  const style = {
    card: {
      width: media !== "mobile" ? "90%" : "95%",
      maxWidth: "100rem",
      margin: "auto",
      marginTop: "3rem",
    },
    cardChild: {
      justifyContent: "space-between",
    },
    cell: {
      padding: "0.3rem",
    },
  };

  const onPageChange = (page) => {
    setParams({ page });
  };

  useEffect(() => {
    getRecords({ params });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    getRecords({ params });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => {
    if (userParams.limit !== userCount && me.role === ROLES.ADMIN) {
      getUsers({
        params: {
          limit: userCount,
          page: 1,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, userCount]);

  const onFilterByNameChange = (e) => {
    setFilterByName(e.target.value);
    setParams({
      page: 1,
      name: e.target.value,
    });
  };

  const handleClick = (item) => {
    const enhancedUsers = _.map(selectedUsers, "_id").includes(item["_id"])
      ? _.filter(selectedUsers, (user) => user["_id"] !== item["_id"])
      : [...selectedUsers, item];
    setSelectedUsers(enhancedUsers);
    setParams({
      page: 1,
      user: _.map(enhancedUsers, "_id"),
    });
  };

  const handleTagRemove = (item, index) => {
    const clonedUsers = Object.assign([], selectedUsers);
    clonedUsers.splice(index, 1);
    setSelectedUsers(clonedUsers);
    setParams({
      page: 1,
      user: _.map(clonedUsers, "_id"),
    });
  };

  const handleClear = () => {
    setSelectedUsers([]);
    setParams({
      page: 1,
      user: [],
    });
  };

  return (
    <div>
      <Header />
      <Card elevation={Elevation.FOUR} style={style.card}>
        <h2>Manage timezones</h2>
        <br />

        <div className={Classes.NAVBAR_GROUP} style={style.cardChild}>
          <AddRow />
          <input
            type="text"
            name="filterByName"
            label="FilterbyName"
            form_label="filterByName"
            placeholder="Filter By Name"
            id="filter"
            onChange={onFilterByNameChange}
            initialvalue=""
            class="bp3-input"
          ></input>
          {me.role === ROLES.ADMIN && (
            <MultiSelectUser
              users={users}
              selectedUsers={selectedUsers}
              handleClick={handleClick}
              handleClear={handleClear}
              handleTagRemove={handleTagRemove}
            />
          )}
        </div>
        {!!records.length && (
          <>
            <Table
              numRows={records.length}
              defaultRowHeight={38}
              columnWidths={
                me.role < ROLES.ADMIN
                  ? [50, 0, 200, 150, 100, 200]
                  : [50, 200, 200, 150, 100, 200]
              }
              renderMode={RenderMode.NONE}
              truncated={false}
              enableRowHeader={false}
              allowSelection={false}
              selectionModes={SelectionModes.NONE}
            >
              <Column
                className={Classes.LARGE}
                name="No"
                allowSelection={false}
                cellRenderer={(row) => (
                  <Cell allowSelection={false}>
                    {row + (params.page - 1) * params.limit + 1}
                  </Cell>
                )}
              />
              <Column
                className={Classes.LARGE}
                name="User"
                cellRenderer={(row) => {
                  if (me.role < ROLES.ADMIN) return <span></span>;
                  return (
                    <Cell>
                      {records[row].user.firstName +
                        " " +
                        records[row].user.lastName}
                    </Cell>
                  );
                }}
              />
              <Column
                className={classNames(Classes.LARGE, "pt-1", "pl-2")}
                name="Name"
                cellRenderer={(row) => <Cell>{records[row].name}</Cell>}
              />
              <Column
                className={Classes.LARGE}
                name="City"
                cellRenderer={(row) => <Cell>{records[row].city}</Cell>}
              />
              <Column
                className={Classes.LARGE}
                name="Timezone"
                cellRenderer={(row) => {
                  const symbol = records[row].difference >= 0 ? "+" : "";
                  return (
                    <Cell>{"GMT" + symbol + records[row].difference}</Cell>
                  );
                }}
              />

              <Column
                name="Actions"
                cellRenderer={(row) => (
                  <Cell style={style.cell}>
                    <ButtonGroup>
                      <EditRow selectedRow={records[row]} users={users} />
                      <DeleteRow selectedRow={records[row]} />
                    </ButtonGroup>
                  </Cell>
                )}
              />
            </Table>
            <Pagination
              initialPage={params.page}
              onPageChange={onPageChange}
              setParams={setParams}
              params={params}
              count={count}
            />
          </>
        )}
        {!records.length && count === 0 && (
          <div className="bp3-non-ideal-state bp3-hotkey-column">
            No records found
          </div>
        )}
      </Card>
    </div>
  );
};

Dashboard.propTypes = {
  setParams: PropTypes.func.isRequired,
  getRecords: PropTypes.func.isRequired,
  records: PropTypes.array.isRequired,
  count: PropTypes.number.isRequired,
  params: PropTypes.object.isRequired,
  generateRecords: PropTypes.func,
};

const mapStateToProps = (state) => ({
  records: state.record.records,
  currentRecord: state.record.currentRecord,
  params: state.record.params,
  count: state.record.count,
  me: state.auth.me,
  userParams: state.user.params,
  users: state.user.users,
  userCount: state.user.count,
  media: state.general.media,
});

const mapDispatchToProps = {
  setParams: setParams,
  getRecords: getRecords,
  getUsers: getUsers,
  generateRecords: generateRecords,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withToast(Dashboard)
);
