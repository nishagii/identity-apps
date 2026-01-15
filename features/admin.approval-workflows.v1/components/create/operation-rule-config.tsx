/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import Alert from "@oxygen-ui/react/Alert";
import AlertTitle from "@oxygen-ui/react/AlertTitle";
import Button from "@oxygen-ui/react/Button";
import Divider from "@oxygen-ui/react/Divider";
import Rules from "@wso2is/admin.rules.v1/components/rules";
import useRulesContext from "@wso2is/admin.rules.v1/hooks/use-rules-context";
import { ConditionExpressionsMetaDataInterface } from "@wso2is/admin.rules.v1/models/meta";
import { RuleWithoutIdInterface } from "@wso2is/admin.rules.v1/models/rules";
import { RulesProvider } from "@wso2is/admin.rules.v1/providers/rules-provider";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import isEqual from "lodash-es/isEqual";
import React, { FunctionComponent, ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./operation-rule-config.scss";

/**
 * Prop types for the OperationRuleConfig component.
 */
interface OperationRuleConfigPropsInterface extends IdentifiableComponentInterface {
    /**
     * Is read only.
     */
    readonly?: boolean;
    /**
     * The rule object.
     */
    rule: RuleWithoutIdInterface;
    /**
     * Whether a rule is configured.
     */
    isHasRule: boolean;
    /**
     * Callback to set the rule.
     */
    setRule: (rule: RuleWithoutIdInterface) => void;
    /**
     * Callback to set whether a rule is configured.
     */
    setIsHasRule: (isHasRule: boolean) => void;
    /**
     * The name of the operation.
     */
    operationName: string;
    /**
     * Rule expressions meta data.
     */
    ruleExpressionsMetaData: ConditionExpressionsMetaDataInterface;
}

/**
 * Inner component to handle rule logic once the provider is mounted.
 */
const OperationRuleConfigContent: FunctionComponent<Partial<OperationRuleConfigPropsInterface>> = ({
    readonly,
    rule,
    setRule,
    setIsHasRule,
    ["data-componentid"]: componentId
}) => {
    const { ruleInstance, ruleExecuteCollection } = useRulesContext();

    /**
     * Sync the local rule state with the rule builder instance.
     */
    useEffect(() => {
        // Wait for the rule collection to be initialized.
        if (!ruleExecuteCollection) {
            return;
        }

        // If the rule instance is empty (last rule removed), revert to "No Rule" state.
        if (ruleExecuteCollection.rules && ruleExecuteCollection.rules.length === 0) {
            setIsHasRule(false);
            setRule(null);

            return;
        }

        if (ruleInstance && !isEqual(ruleInstance, rule)) {
            setRule(ruleInstance as RuleWithoutIdInterface);
        }
    }, [ruleExecuteCollection, ruleInstance]);

    return (
        <Rules
            disableLastRuleDelete={false}
            readonly={readonly}
            data-componentid={`${componentId}-rules`}
        />
    );
};

/**
 * Component to configure rules for a single operation.
 */
const OperationRuleConfig: FunctionComponent<OperationRuleConfigPropsInterface> = ({
    readonly,
    rule,
    isHasRule,
    setRule,
    setIsHasRule,
    operationName,
    ruleExpressionsMetaData,
    ["data-componentid"]: componentId = "operation-rule-config"
}: OperationRuleConfigPropsInterface): ReactElement => {
    const { t } = useTranslation();

    const handleConfigureRule = () => {
        setIsHasRule(true);
    };

    return (
        <div className="operation-rule-config" data-componentid={componentId}>
            <Divider className="divider-container" />
            {!isHasRule ? (
                <Alert
                    className="alert-nutral"
                    icon={false}
                    data-componentid={`${componentId}-no-rule-alert`}
                >
                    <AlertTitle
                        className="alert-title"
                        data-componentid={`${componentId}-no-rule-alert-title`}
                    >
                        {t("approvalWorkflows:forms.rules.noRuleTitle")}
                    </AlertTitle>
                    <div className="alert-message">
                        {t("approvalWorkflows:forms.rules.noRuleConfigured", {
                            operationName: operationName
                        })}
                    </div>
                    <div className="configure-button-container">
                        <Button
                            variant="outlined"
                            size="small"
                            className="secondary-button"
                            onClick={handleConfigureRule}
                            data-componentid={`${componentId}-configure-button`}
                            disabled={readonly}
                        >
                            {t("approvalWorkflows:forms.rules.configureRule")}
                        </Button>
                    </div>
                </Alert>
            ) : (
                <div className="rule-editor-container">
                    <RulesProvider
                        conditionExpressionsMetaData={ruleExpressionsMetaData}
                        initialData={rule}
                    >
                        <OperationRuleConfigContent
                            readonly={readonly}
                            rule={rule}
                            setRule={setRule}
                            setIsHasRule={setIsHasRule}
                            data-componentid={componentId}
                        />
                    </RulesProvider>
                </div>
            )}
        </div>
    );
};

export default OperationRuleConfig;
