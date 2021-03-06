// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SubmittableExtrinsic } from '@polkadot/api/types';

import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, InputAddress, InputBalanceBonded, Modal, TxButton } from '@polkadot/react-components';
import { useApi, useToggle } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';
import InputValidateAmount from './Account/InputValidateAmount';
import InputValidationController from './Account/InputValidationController';
import { rewardDestinationOptions } from './constants';

interface Props {
  className?: string;
  isInElection?: boolean;
}

function NewStake ({ className, isInElection }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, toggleVisible] = useToggle();
  const [amount, setAmount] = useState<BN | undefined>();
  const [amountError, setAmountError] = useState<string | null>(null);
  const [, setControllerError] = useState<string | null>(null);
  const [controllerId, setControllerId] = useState<string | null>(null);
  const [destination, setDestination] = useState(0);
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [stashId, setStashId] = useState<string | null>(null);

  useEffect((): void => {
    setExtrinsic(
      () => (amount && controllerId)
        ? api.tx.staking.bond(controllerId, amount, destination)
        : null
    );
  }, [api, amount, controllerId, destination]);

  const hasValue = !!amount?.gtn(0);
  const canSubmit = hasValue && !!controllerId;

  return (
    <div className={className}>
      <Button.Group>
        <Button
          icon='add'
          isDisabled={isInElection}
          key='new-stake'
          label={t('New stake')}
          onClick={toggleVisible}
        />
      </Button.Group>
      {isVisible && (
        <Modal
          className='staking--Bonding'
          header={t('Bonding Preferences')}
          size='small'
        >
          <Modal.Content className='ui--signer-Signer-Content'>
            <InputAddress
              className='medium'
              label={t('stash account')}
              onChange={setStashId}
              type='account'
              value={stashId}
            />
            <InputAddress
              className='medium'
              help={t('The controller is the account that will be used to control any nominating or validating actions. Should not match another stash or controller.')}
              label={t('controller account')}
              onChange={setControllerId}
              type='account'
              value={controllerId}
            />
            <InputValidationController
              accountId={stashId}
              controllerId={controllerId}
              onError={setControllerError}
            />
            <InputBalanceBonded
              autoFocus
              className='medium'
              controllerId={controllerId}
              destination={destination}
              extrinsicProp={'staking.bond'}
              help={t('The total amount of the stash balance that will be at stake in any forthcoming rounds (should be less than the total amount available)')}
              isError={!hasValue || !!amountError}
              label={t('value bonded')}
              onChange={setAmount}
              stashId={stashId}
            />
            <InputValidateAmount
              accountId={stashId}
              onError={setAmountError}
              value={amount}
            />
            <Dropdown
              className='medium'
              defaultValue={0}
              help={t('The destination account for any payments as either a nominator or validator')}
              label={t('payment destination')}
              onChange={setDestination}
              options={rewardDestinationOptions}
              value={destination}
            />
          </Modal.Content>
          <Modal.Actions onCancel={toggleVisible}>
            <TxButton
              accountId={stashId}
              extrinsic={extrinsic}
              icon='sign-in'
              isDisabled={!canSubmit}
              isPrimary
              label={t('Bond')}
              onStart={toggleVisible}
            />
          </Modal.Actions>
        </Modal>
      )}
    </div>
  );
}

export default React.memo(NewStake);
