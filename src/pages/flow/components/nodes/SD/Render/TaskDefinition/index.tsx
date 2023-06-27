import { PlayCircleOutlined } from '@ant-design/icons';
import { useDebounce } from 'ahooks';
import { createStyles } from 'antd-style';
import { BasicNode, NodeField, useFlowEditor } from 'kitchen-flow-editor';
import { ReactNode, memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import TaskExample from './TaskExample';

import { IconAction } from '@/components/IconAction';
import { flowSelectors, useFlowStore } from '@/store/flow';
import { SDTaskType } from '@/types/flow/node/sdTask';
import { Segmented } from 'antd';

const useStyles = createStyles(({ css, token, prefixCls, isDarkMode }) => ({
  container: css`
    .${prefixCls}-card-head {
      position: relative;
      &-wrapper {
        z-index: 1;
      }
    }
  `,
  progress: css`
    .${prefixCls}-card-head {
      :before {
        position: absolute;
        top: -1px;
        left: 0;

        display: block;

        width: var(--task-loading-progress, 0);
        height: 10px;

        background-image: linear-gradient(
          to right,
          ${isDarkMode ? token.cyan6 : token.cyan3},
          ${isDarkMode ? token.blue6 : token.blue4}
        );
        border-radius: 8px;
        border-bottom-left-radius: 0;

        transition: all 300ms ease-out;
      }
    }
  `,
}));
interface TaskDefinitionProps {
  selected: boolean;
  loading?: boolean;
  id: string;
  className?: string;
  title?: string;
  headerExtra?: ReactNode;
}

const TaskDefinition = memo<TaskDefinitionProps>(
  ({ loading, id, selected, headerExtra, title, className }) => {
    const [model, size, collapsedKeys, runFlowNode, abortFlowNode] = useFlowStore((s) => {
      const agent = flowSelectors.getNodeByIdSafe<SDTaskType>(id)(s);
      return [
        agent.data.content.model,
        agent.data.content.size,
        agent.data.state?.collapsedKeys,
        s.runFlowNode,
        s.abortFlowNode,
        s.activeId,
      ];
    }, shallow);

    const { styles, theme, cx } = useStyles();

    const [percent, setPercent] = useState(10);
    const editor = useFlowEditor();
    const showProgress = useDebounce(loading, { wait: 1000 });

    useEffect(() => {
      let intervalId: NodeJS.Timer;

      if (loading) {
        intervalId = setInterval(() => {
          setPercent((prevProgress) => {
            const nextProgress = prevProgress + 1;

            if (nextProgress >= 90) {
              clearInterval(intervalId);
            }

            return nextProgress;
          });
        }, 300);
      } else {
        setPercent(100);
        setTimeout(() => {
          setPercent(0);
        }, 1000);
      }

      return () => clearInterval(intervalId);
    }, [loading]);

    return (
      <BasicNode
        id={id}
        title={title}
        active={selected}
        collapsedKeys={collapsedKeys}
        extra={
          <Flexbox horizontal gap={4}>
            {loading ? (
              <IconAction
                title={'停止'}
                type={'danger'}
                icon={
                  <div
                    style={{ width: 16, height: 16, borderRadius: 2, background: theme.colorError }}
                  />
                }
                onClick={() => {
                  abortFlowNode(id);
                }}
              />
            ) : null}
            <IconAction
              title={'执行节点'}
              loading={loading}
              icon={<PlayCircleOutlined />}
              onClick={() => {
                runFlowNode(id);
              }}
            />
            {headerExtra}
          </Flexbox>
        }
        className={cx(styles.container, className, showProgress && styles.progress)}
        style={{ '--task-loading-progress': `${percent}%` } as any}
      >
        <NodeField title={'模型'} id={'model'}>
          <Segmented
            value={model}
            onChange={(value) => {
              editor.updateNodeContent(id, 'model', value);
            }}
            block
            style={{
              width: '100%',
            }}
            defaultValue="chilloutmix_NiPrunedFp32Fix"
            options={[
              {
                title: '二次元',
                model_name: 'camelliamix_v20',
                hash: '2eb0c2a23a',
                sha256: '2eb0c2a23ab412553c0f26001bc683d9229c78b6eb35880dd8074873a986457f',
                filename: 'D:\\github\\good\\models\\Stable-diffusion\\camelliamix_v20.safetensors',
              },
              {
                title: 'anything',
                model_name: 'v1-5-pruned-emaonly',
                hash: '6ce0161689',
                sha256: '6ce0161689b3853acaa03779ec93eafe75a02f4ced659bee03f50797806fa2fa',
              },
              {
                title: '真人',
                model_name: 'chilloutmix_NiPrunedFp32Fix',
                hash: 'fc2511737a',
                sha256: 'fc2511737a54c5e80b89ab03e0ab4b98d051ab187f92860f3cd664dc9d08b271',
              },
            ].map((item) => {
              return {
                label: item.title,
                key: item.model_name,
                value: item.model_name,
              };
            })}
          />
        </NodeField>
        <NodeField title={'尺寸'} id={'size'}>
          <Segmented
            style={{
              width: '100%',
            }}
            block
            value={size}
            onChange={(value) => {
              editor.updateNodeContent(id, 'size', value);
            }}
            options={[
              {
                label: '落地页',
                value: 'landing',
              },
              {
                label: '头像',
                value: 'avatar',
              },
              {
                label: '4:3',
                value: '4:3',
              },
            ]}
          />
        </NodeField>
        <TaskExample id={id} />
      </BasicNode>
    );
  },
);

export default TaskDefinition;