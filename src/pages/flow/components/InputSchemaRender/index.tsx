﻿import Markdown from '@/components/Markdown';
import { flowSelectors, useFlowStore } from '@/store/flow';
import { Input, Segmented } from 'antd';
import { NodeField, useFlowEditor } from 'kitchen-flow-editor';
import { get, set } from 'rc-util';
import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { SymbolSchemaRenderMap } from '../nodes';
import SystemRole from './SystemRole';
import TaskPromptsInput from './TaskPromptsInput';
import { TextAreaInput } from './TextAreaInput';

export const InputSchemaRender: React.FC<{
  id: string;
  type?: string;
  readonly?: boolean;
}> = (props) => {
  const editor = useFlowEditor();
  const [nodeData, node] = useFlowStore((s) => {
    const node = flowSelectors.getNodeByIdSafe<Record<string, any>>(props.id)(s);
    return [node.data.content, node];
  }, shallow);

  const id = props.id;

  /**
   * 设置值
   * @param valueKey
   * @param newValue
   * @returns void
   */
  const setValue = (valueKey: string | string[], newValue: any) => {
    if (Array.isArray(valueKey) && valueKey.length > 1) {
      const updateValue = set(nodeData, valueKey, newValue);
      const newDataValue = get(updateValue, [valueKey.at(0) as string]);
      editor.updateNodeContent<Record<string, any>>(id, valueKey.at(0) as string, newDataValue);
      return;
    }
    editor.updateNodeContent<Record<string, any>>(id, valueKey?.toString(), newValue);
  };

  const nodeType = useMemo(() => props.type || node.type || 'string', [props.type, node.type]);

  const schema = useMemo(
    () => Object.keys(SymbolSchemaRenderMap[nodeType]),
    [node.type, props.type],
  );

  return schema.map((key) => {
    const item = SymbolSchemaRenderMap[nodeType][key];
    const component = item.component;
    const valueKey = item.valueKey || key;
    const value = get(nodeData, [valueKey].flat(1));
    const RenderComponent = () => {
      // 如果是只读模式直接返回  markdown
      if (props.readonly)
        return value ? (
          <Markdown key={valueKey.toString()}>{value}</Markdown>
        ) : (
          <span key={valueKey.toString()}>请输入</span>
        );
      return (
        <>
          {component === 'Input' ? (
            <Input
              value={value}
              key={valueKey.toString()}
              className={'nowheel nodrag'}
              placeholder={'请输入' + item.title}
              onChange={(e) => {
                setValue(valueKey, e.target.value);
              }}
            />
          ) : null}
          {component === 'InputArea' ? (
            <TextAreaInput
              value={value}
              key={valueKey.toString()}
              placeholder={'请输入' + item.title}
              onChange={(value) => {
                setValue(valueKey, value);
              }}
            />
          ) : null}
          {component === 'Segmented' ? (
            <Segmented
              block
              value={value}
              key={valueKey.toString()}
              className={'nowheel nodrag'}
              options={item.options || []}
              placeholder={'请选择' + item.title}
              onChange={(e) => {
                setValue(valueKey, e);
              }}
            />
          ) : null}
          {component === 'SystemRole' ? (
            <SystemRole
              id={id}
              key={valueKey.toString()}
              valueKey={valueKey.toString()}
              title={item.title}
              value={value}
              onChange={(e) => {
                setValue(valueKey, e);
              }}
            />
          ) : null}

          {component === 'TaskPromptsInput' ? (
            <TaskPromptsInput
              valueKey={valueKey.toString()}
              id={id}
              key={valueKey.toString()}
              title={item.title}
              value={value}
              onChange={(e) => {
                setValue(valueKey, e);
              }}
            />
          ) : null}
        </>
      );
    };
    if (item.hideContainer && !props.readonly) return <RenderComponent />;
    return (
      <NodeField
        key={key}
        id={key}
        title={item.title}
        handles={item.handles}
        valueContainer={item.valueContainer === false && !props.readonly ? false : true}
      >
        <RenderComponent />
      </NodeField>
    );
  });
};
