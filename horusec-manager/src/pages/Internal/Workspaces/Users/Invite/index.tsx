/**
 * Copyright 2020 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import { Dialog, Select, Permissions } from 'components';
import { useTranslation } from 'react-i18next';
import Styled from './styled';
import { isValidEmail } from 'helpers/validators';
import { Field } from 'helpers/interfaces/Field';
import { useTheme } from 'styled-components';
import companyService from 'services/company';
import useResponseMessage from 'helpers/hooks/useResponseMessage';
import useFlashMessage from 'helpers/hooks/useFlashMessage';
import { Workspace } from 'helpers/interfaces/Workspace';

interface Props {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  selectedWorkspace: Workspace;
}

interface Role {
  name: string;
  value: string;
}

const InviteToCompany: React.FC<Props> = ({
  isVisible,
  onCancel,
  onConfirm,
  selectedWorkspace,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { dispatchMessage } = useResponseMessage();
  const { showSuccessFlash } = useFlashMessage();

  const roles: Role[] = [
    {
      name: t('PERMISSIONS.ADMIN'),
      value: 'admin',
    },
    {
      name: t('PERMISSIONS.MEMBER'),
      value: 'member',
    },
  ];

  const [isLoading, setLoading] = useState(false);
  const [permissionsIsOpen, setPermissionsIsOpen] = useState(false);

  const [email, setEmail] = useState<Field>({ value: '', isValid: false });
  const [role, setRole] = useState<Role>(null);

  const resetFields = () => {
    const defaultValue = { value: '', isValid: false };
    setEmail(defaultValue);
    setRole(null);
  };

  const handleConfirmSave = () => {
    if (email.isValid) {
      setLoading(true);

      companyService
        .createUserInCompany(
          selectedWorkspace?.companyID,
          email.value,
          role.value
        )
        .then(() => {
          showSuccessFlash(t('WORKSPACES_SCREEN.USERS.INVITE_SUCCESS'));
          onConfirm();
          resetFields();
        })
        .catch((err) => {
          dispatchMessage(err?.response?.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Dialog
      isVisible={isVisible}
      message={t('WORKSPACES_SCREEN.USERS.INVITE')}
      onCancel={() => {
        onCancel();
        resetFields();
      }}
      onConfirm={handleConfirmSave}
      confirmText={t('WORKSPACES_SCREEN.USERS.SAVE')}
      disableConfirm={!email.isValid || !role}
      disabledColor={colors.button.disableInDark}
      loadingConfirm={isLoading}
      width={450}
      hasCancel
    >
      <Styled.SubTitle>
        {t('WORKSPACES_SCREEN.USERS.INVITE_SUBTITLE')}
      </Styled.SubTitle>

      <Styled.Field
        label={t('WORKSPACES_SCREEN.USERS.EMAIL')}
        invalidMessage={t('WORKSPACES_SCREEN.USERS.INVALID_EMAIL')}
        onChangeValue={(field: Field) => setEmail(field)}
        validation={isValidEmail}
        name="email"
        type="text"
        width="100%"
      />

      <Styled.RoleWrapper>
        <Select
          rounded
          keyLabel="name"
          keyValue="value"
          width="340px"
          optionsHeight="65px"
          options={roles}
          onChangeValue={(item) => setRole(item)}
        />

        <Styled.HelpIcon
          name="help"
          size="20px"
          onClick={() => setPermissionsIsOpen(true)}
        />
      </Styled.RoleWrapper>

      <Permissions
        isOpen={permissionsIsOpen}
        onClose={() => setPermissionsIsOpen(false)}
        rolesType="COMPANY"
      />
    </Dialog>
  );
};

export default InviteToCompany;
