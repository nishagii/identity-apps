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

import Accordion from "@oxygen-ui/react/Accordion";
import AccordionDetails from "@oxygen-ui/react/AccordionDetails";
import AccordionSummary from "@oxygen-ui/react/AccordionSummary";
import Box from "@oxygen-ui/react/Box";
import Typography from "@oxygen-ui/react/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useGetRulesMeta from "@wso2is/admin.rules.v1/api/use-get-rules-meta";
import { RuleWithoutIdInterface } from "@wso2is/admin.rules.v1/models/rules";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import { EmphasizedSegment } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OperationRuleConfig from "./operation-rule-config";
import { DropdownPropsInterface } from "../../models/ui";
import "./approval-workflow-rules-config.scss";

/**
 * Rule state per operation.
 */
export interface OperationRuleState {
    isHasRule: boolean;
    rule: RuleWithoutIdInterface | null;
}

/**
 * Props interface for ApprovalWorkflowRulesConfig.
 */
interface ApprovalWorkflowRulesConfigPropsInterface extends IdentifiableComponentInterface {
    /**
     * List of operations to configure rules for.
     */
    operations: DropdownPropsInterface[];
    /**
     * Initial rules keyed by operation value.
     */
    initialRules?: Record<string, RuleWithoutIdInterface>;
    /**
     * Callback when rules change.
     */
    onChange: (rules: Record<string, RuleWithoutIdInterface>) => void;
    /**
     * Whether the component is in read-only mode.
     */
    isReadOnly?: boolean;
}

/**
 * Component that renders rule configuration UI for multiple operations.
 * Each operation gets its own RulesProvider context for isolated state management.
 *
 * @param props - Component props.
 * @returns ApprovalWorkflowRulesConfig component.
 */
const ApprovalWorkflowRulesConfig: FunctionComponent<ApprovalWorkflowRulesConfigPropsInterface> = ({
    operations,
    initialRules = {},
    onChange,
    isReadOnly = false,
    ["data-componentid"]: componentId = "approval-workflow-rules-config"
}: ApprovalWorkflowRulesConfigPropsInterface): ReactElement => {
    const { t } = useTranslation();

    // State to track rules for each operation
    const [operationRuleStates, setOperationRuleStates] = useState<Record<string, OperationRuleState>>(() => {
        const initial: Record<string, OperationRuleState> = {};

        operations.forEach((operation: DropdownPropsInterface) => {
            initial[operation.value] = {
                isHasRule: !!initialRules[operation.value],
                rule: initialRules[operation.value] || null
            };
        });

        return initial;
    });

    /**
     * Effect to sync operationRuleStates with operations from Tab 1.
     */
    useEffect(() => {
        setOperationRuleStates((prev: Record<string, OperationRuleState>) => {
            const newState: Record<string, OperationRuleState> = { ...prev };
            let hasChanges = false;

            // Add operations and initialize from initialRules if new
            operations.forEach((operation: DropdownPropsInterface) => {
                if (!newState[operation.value]) {
                    newState[operation.value] = {
                        isHasRule: !!initialRules[operation.value],
                        rule: initialRules[operation.value] || null
                    };
                    hasChanges = true;
                }
            });

            // Remove operations not present any more
            Object.keys(newState).forEach((key: string) => {
                if (!operations.find((op: DropdownPropsInterface) => op.value === key)) {
                    delete newState[key];
                    hasChanges = true;
                }
            });

            return hasChanges ? newState : prev;
        });
    }, [operations]);

    // Get rules metadata for workflow associations
    // TODO: Change this to the correct flow for workflow associations once available in the backend.
    const { data: ruleExpressionsMetaData } = useGetRulesMeta("workflowRules");

    /**
     * Notify parent of the change.
     * @param newState - New state to notify parent about.
     */
    const notifyParent = (newState: Record<string, OperationRuleState>) => {
        const updatedRules: Record<string, RuleWithoutIdInterface> = {};

        Object.entries(newState).forEach(([key, state]: [string, OperationRuleState]) => {
            // Only include in final payload if rule configuration is active
            if (state.isHasRule && state.rule) {
                updatedRules[key] = state.rule;
            }
        });

        onChange(updatedRules);
    };

    /**
     * Handle rule change for a specific operation.
     * @param operationValue - The operation value.
     * @param rule - The new rule.
     */
    const handleRuleChange = (operationValue: string, rule: RuleWithoutIdInterface): void => {
        setOperationRuleStates((prev: Record<string, OperationRuleState>) => {
            const newState: Record<string, OperationRuleState> = {
                ...prev,
                [operationValue]: {
                    ...prev[operationValue],
                    rule
                }
            };

            notifyParent(newState);

            return newState;
        });
    };

    /**
     * Handle isHasRule change for a specific operation.
     * @param operationValue - The operation value.
     * @param isHasRule - Whether a rule is configured.
     */
    const handleIsHasRuleChange = (operationValue: string, isHasRule: boolean): void => {
        setOperationRuleStates((prev: Record<string, OperationRuleState>) => {
            const newState: Record<string, OperationRuleState> = {
                ...prev,
                [operationValue]: {
                    ...prev[operationValue],
                    isHasRule
                }
            };

            notifyParent(newState);

            return newState;
        });
    };

    if (operations.length === 0) {
        return (
            <EmphasizedSegment padded="very" className="configure-rules-placeholder">
                <Typography variant="body1" align="center" color="textSecondary" data-componentid={`${componentId}-placeholder`}>
                    {t("approvalWorkflows:pageLayout.create.tabs.configureRulesPlaceholder")}
                </Typography>
            </EmphasizedSegment>
        );
    }

    return (
        <div className="approval-workflow-rules-config" data-componentid={componentId}>
            {operations.map((operation: DropdownPropsInterface) => {
                const operationState: OperationRuleState = operationRuleStates[operation.value] || {
                    isHasRule: false,
                    rule: null
                };

                return (
                    <Accordion
                        key={operation.value}
                        data-componentid={`${componentId}-accordion-${operation.value}`}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            data-componentid={`${componentId}-accordion-summary-${operation.value}`}
                        >
                            <Box className="accordion-summary-content">
                                <Typography variant="h6">{operation.text}</Typography>
                                {operationState.isHasRule && operationState.rule && (
                                    <Typography
                                        variant="body2"
                                        className="rule-configured-badge"
                                    >
                                        <CheckCircleIcon fontSize="inherit" />
                                        {t("approvalWorkflows:forms.rules.ruleConfigured")}
                                    </Typography>
                                )}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails data-componentid={`${componentId}-accordion-details-${operation.value}`}>
                            {ruleExpressionsMetaData ? (
                                <OperationRuleConfig
                                    readonly={isReadOnly}
                                    rule={operationState.rule}
                                    isHasRule={operationState.isHasRule}
                                    setRule={(rule: RuleWithoutIdInterface) =>
                                        handleRuleChange(operation.value, rule)
                                    }
                                    setIsHasRule={(val: boolean) =>
                                        handleIsHasRuleChange(operation.value, val)
                                    }
                                    operationName={operation.text || operation.value}
                                    ruleExpressionsMetaData={ruleExpressionsMetaData}
                                    data-componentid={`${componentId}-rule-config-${operation.value}`}
                                />
                            ) : (
                                <Typography variant="body2" color="textSecondary" align="center">
                                    {t("approvalWorkflows:forms.rules.loadingRulesMeta")}
                                </Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </div>
    );
};

export default ApprovalWorkflowRulesConfig;
