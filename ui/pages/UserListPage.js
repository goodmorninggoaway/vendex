import React from 'react';
import UserList from '../modules/user/UserList';

const UserListPage = ({ roles, congregationId }) => (
  <UserList
    isAdmin={roles.indexOf('admin') != -1}
    congregationId={congregationId}
  />
);

export default UserListPage;
